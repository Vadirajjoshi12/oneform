import { Request, Response } from "express";
import Pool from "../models/Pool";
import { publicPoolDTO } from "../dto/pool.dto";
import { syncPoolState } from "../services/pool-state.service";

export const getNearbyPools = async (
  req: Request,
  res: Response
) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radius);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      isNaN(radiusKm)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location"
      });
    }

    let pools = await Pool.find({
      status: "active",

      // Only pools that haven't expired
      expiresAt: {
        $gt: new Date()
      },

      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },

          $maxDistance: radiusKm * 1000
        }
      }
    });

    // Synchronize the actual state of each pool
    for (const pool of pools) {
      await syncPoolState(pool);
    }

    // Remove pools that reached the threshold
    pools = pools.filter(
      (pool) => pool.status === "active"
    );

    return res.json({
      success: true,
      count: pools.length,
      data: pools.map(publicPoolDTO)
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed"
    });
  }
};