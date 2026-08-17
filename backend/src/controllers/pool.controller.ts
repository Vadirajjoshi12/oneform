import { Request, Response } from "express";
import Pool from "../models/Pool";
import { buildPool } from "../services/pool.service";
import { createHostSession } from "../services/host.service";
import { publicPoolDTO } from "../dto/pool.dto";

export const createPool = async (
  req: Request,
  res: Response
) => {
  try {
        const existingPool = await Pool.findOne({
  status: "active",
  "members.phone": req.body.host.phone,
  "members.isHost": true,
});
if (existingPool) {
  return res.status(409).json({
    success: false,
    message: "You already have an active pool.",
  });
}
    // Build secure pool object
    const poolData = buildPool(req.body);

    // Save pool
    const pool = await Pool.create(poolData);

    // Create host session
    const hostToken = await createHostSession(
      pool._id.toString(),
      pool.expiresAt
    );

    return res.status(201).json({
  success: true,
  message: "Pool created successfully",
  hostToken,
  data: publicPoolDTO(pool),
});

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create pool",
    });

  }
};

export const getPoolById = async (
  req: Request,
  res: Response
) => {
  try {
    const { poolId } = req.params;

    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "Pool not found",
      });
    }

    // Sync expired pool
    if (
      pool.status === "active" &&
      new Date(pool.expiresAt).getTime() <= Date.now()
    ) {
      pool.status = "expired";
      pool.deliveryStatus = "Expired";

      await pool.save();
    }

    // Calculate pool total
    const poolTotal = pool.members.reduce(
      (total: number, member: any) => {
        return total + member.cartTotal;
      },
      0
    );

    // Calculate remaining amount
    const remainingAmount = Math.max(
      pool.targetThreshold - poolTotal,
      0
    );

    // Calculate time left
    const timeLeftMinutes = Math.max(
      Math.ceil(
        (new Date(pool.expiresAt).getTime() - Date.now()) /
          (1000 * 60)
      ),
      0
    );

    return res.status(200).json({
      success: true,
      message: "Pool found",
      data: {
        id: pool._id,
        platform: pool.platform,
        pickupLocation: pool.pickupLocation,

        targetThreshold: pool.targetThreshold,

        memberCount: pool.members.length,

        poolTotal,

        remainingAmount,

        timeLeftMinutes,

        status: pool.status,

        deliveryStatus: pool.deliveryStatus,

        note: pool.note,

        members: pool.members.map((member: any) => ({
          id: member._id,
          name: member.name,
          isHost: member.isHost,
          cartTotal: member.cartTotal,

          items: member.items.map((item: any) => ({
            id: item._id,
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.price,
          })),

          joinedAt: member.joinedAt,
        })),
      },
    });

  } catch (error) {

    console.error("Get pool error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get pool",
    });
  }
};

export const cancelPool = async (
  req: Request,
  res: Response
) => {
  try {
    const { poolId } = req.params;
    const { phone } = req.body;

    // Find pool
    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "Pool not found"
      });
    }

    // Check if pool is already cancelled
    if (pool.status === "cancelled") {
      return res.status(409).json({
        success: false,
        message: "Pool is already cancelled"
      });
    }

    // Check if pool has expired
    if (
      new Date(pool.expiresAt).getTime() <= Date.now()
    ) {
      if (pool.status === "active") {
        pool.status = "expired";
        pool.deliveryStatus = "Expired";

        await pool.save();
      }

      return res.status(409).json({
        success: false,
        message: "Pool has expired"
      });
    }

    // Find the member using phone
    const member = pool.members.find(
      (member: any) => member.phone === phone
    );

    // Phone does not belong to anyone in the pool
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this pool"
      });
    }

    // Only host can cancel
    if (!member.isHost) {
      return res.status(403).json({
        success: false,
        message: "Only the host can cancel the pool"
      });
    }

    // Cancel pool
    pool.status = "cancelled";
    pool.deliveryStatus = "Cancelled";

    await pool.save();

    return res.status(200).json({
      success: true,
      message: "Pool cancelled successfully",
      data: publicPoolDTO(pool)
    });

  } catch (error) {

    console.error("Cancel pool error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel pool"
    });
  }
};

export const placeOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const { poolId } = req.params;
    const { phone } = req.body;

    // Find pool
    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "Pool not found"
      });
    }

    // Check expiry
    if (
      new Date(pool.expiresAt).getTime() <= Date.now()
    ) {
      if (pool.status === "active") {
        pool.status = "expired";
        pool.deliveryStatus = "Expired";

        await pool.save();
      }

      return res.status(409).json({
        success: false,
        message: "Pool has expired"
      });
    }

    // Pool must have reached the target
    if (pool.status !== "threshold_met") {
      return res.status(409).json({
        success: false,
        message: "Pool target has not been reached"
      });
    }

    // Order can only be placed from Target Reached state
    if (pool.deliveryStatus !== "Target Reached") {
      return res.status(409).json({
        success: false,
        message: "Order has already been placed or processed"
      });
    }

    // Find requesting member
    const member = pool.members.find(
      (member: any) => member.phone === phone
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this pool"
      });
    }

    // Only host can place the order
    if (!member.isHost) {
      return res.status(403).json({
        success: false,
        message: "Only the host can place the order"
      });
    }

    // Place order
    pool.deliveryStatus = "Order Placed";

    await pool.save();

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data: publicPoolDTO(pool)
    });

  } catch (error) {

    console.error("Place order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to place order"
    });
  }
};
export const updateDeliveryStatus = async (req: any, res: any) => {
  try {
    const { poolId } = req.params;
    const { phone, deliveryStatus } = req.body;

    // Validate request
    if (!phone || !deliveryStatus) {
      return res.status(400).json({
        success: false,
        message: "Phone and delivery status are required"
      });
    }

    // Find pool FIRST
    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "Pool not found"
      });
    }

    // Find requesting member
    const member = pool.members.find(
      (member: any) => member.phone === phone
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this pool"
      });
    }

    // Only host can update delivery status
    if (!member.isHost) {
      return res.status(403).json({
        success: false,
        message: "Only the host can update delivery status"
      });
    }

    // Allowed delivery status sequence
    const allowedTransitions: Record<string, string> = {
      "Cart Open": "Target Reached",
      "Target Reached": "Order Placed",
      "Order Placed": "Preparing",
      "Preparing": "Out for Delivery",
      "Out for Delivery": "Delivered"
    };

    const expectedNextStatus =
      allowedTransitions[pool.deliveryStatus];

    // Current status cannot move further
    if (!expectedNextStatus) {
      return res.status(409).json({
        success: false,
        message: `Delivery status cannot be changed from ${pool.deliveryStatus}`
      });
    }

    // Prevent skipping stages
    if (deliveryStatus !== expectedNextStatus) {
      return res.status(409).json({
        success: false,
        message:
          `Invalid status transition: ${pool.deliveryStatus} → ${deliveryStatus}. ` +
          `Expected: ${expectedNextStatus}`
      });
    }

    // Update status
    pool.deliveryStatus = deliveryStatus;

    // If target is reached, update pool status too
    if (deliveryStatus === "Target Reached") {
      pool.status = "threshold_met";
    }

    // If order is placed
    if (deliveryStatus === "Order Placed") {
      pool.status = "threshold_met";
    }

    await pool.save();

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      data: publicPoolDTO(pool)
    });

  } catch (error) {
    console.error(
      "Update delivery status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update delivery status"
    });
  }
};