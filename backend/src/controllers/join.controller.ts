import { Request, Response } from "express";
import Pool from "../models/Pool";
import { publicPoolDTO } from "../dto/pool.dto";

export const joinPool = async (
  req: Request,
  res: Response
) => {
  try {
    const { poolId } = req.params;

    const {
      name,
      phone,
      items
    } = req.body;

    // Calculate the new member's cart total
    const cartTotal = items.reduce(
      (total: number, item: any) => {
        return total + item.price * item.quantity;
      },
      0
    );

    // Atomic join. A pool remains joinable after reaching the target
    // until the host places/cancels the order or the pool expires.
    const updatedPool = await Pool.findOneAndUpdate(
      {
        _id: poolId,
        status: { $in: ["active", "threshold_met"] },
        expiresAt: {
          $gt: new Date()
        },
        "members.phone": {
          $ne: phone
        }
      },
      {
        $push: {
          members: {
            isHost: false,
            name,
            phone,
            cartTotal,
            items,
            joinedAt: new Date()
          }
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    // Pool wasn't updated
    if (!updatedPool) {

      const pool = await Pool.findById(poolId);

      if (!pool) {
        return res.status(404).json({
          success: false,
          message: "Pool not found"
        });
      }

      if (pool.status === "threshold_met") {
        return res.status(409).json({
          success: false,
          message: "Pool is no longer accepting members"
        });
      }

      if (pool.status !== "active") {
        return res.status(409).json({
          success: false,
          message: "Pool is not active"
        });
      }

      if (
        new Date(pool.expiresAt).getTime() <= Date.now()
      ) {
        return res.status(409).json({
          success: false,
          message: "Pool has expired"
        });
      }

      const alreadyJoined = pool.members.some(
        (member: any) => member.phone === phone
      );

      if (alreadyJoined) {
        return res.status(409).json({
          success: false,
          message: "You have already joined this pool"
        });
      }

      return res.status(409).json({
        success: false,
        message: "Unable to join pool"
      });
    }

    // Calculate total AFTER the new member was added
    const poolTotal = updatedPool.members.reduce(
      (total: number, member: any) => {
        return total + member.cartTotal;
      },
      0
    );

    // Check whether target has been reached
    if (
      poolTotal >= updatedPool.targetThreshold
    ) {
      updatedPool.status = "threshold_met";
      updatedPool.deliveryStatus = "Target Reached";

      await updatedPool.save();
    }

    return res.status(200).json({
      success: true,
      message: "Joined pool successfully",
      data: publicPoolDTO(updatedPool)
    });

  } catch (error) {

    console.error("Join pool error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to join pool"
    });
  }
};
export const leavePool = async (
  req: Request,
  res: Response
) => {
  try {
    const { poolId } = req.params;
    const { phone } = req.body;

    // Find the pool
    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "Pool not found"
      });
    }

    // Pool must be active
    if (pool.status !== "active") {
      return res.status(409).json({
        success: false,
        message: "Cannot leave this pool"
      });
    }

    // Check expiry
    if (
      new Date(pool.expiresAt).getTime() <= Date.now()
    ) {
      return res.status(409).json({
        success: false,
        message: "Pool has expired"
      });
    }

    // Find member
    const member = pool.members.find(
      (member: any) => member.phone === phone
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this pool"
      });
    }

    // Host cannot leave
    if (member.isHost) {
      return res.status(409).json({
        success: false,
        message: "Host cannot leave the pool"
      });
    }

    // Remove member
    pool.members = pool.members.filter(
      (member: any) => member.phone !== phone
    ) as any;

    // Recalculate total
    const poolTotal = pool.members.reduce(
      (total: number, member: any) => {
        return total + member.cartTotal;
      },
      0
    );

    // Update status
    if (poolTotal >= pool.targetThreshold) {
      pool.status = "threshold_met";
      pool.deliveryStatus = "Target Reached";
    } else {
      pool.status = "active";
      pool.deliveryStatus = "Cart Open";
    }

    await pool.save();

    return res.status(200).json({
      success: true,
      message: "Left pool successfully",
      data: publicPoolDTO(pool)
    });

  } catch (error) {

    console.error("Leave pool error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to leave pool"
    });
  }
};