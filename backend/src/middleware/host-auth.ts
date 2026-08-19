import { Request, Response, NextFunction } from "express";
import HostSession from "../models/HostSession";
import { hashHostToken } from "../services/host.service";

export const requireHostToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Host authorization required"
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Host authorization required"
      });
    }

    const tokenHash = hashHostToken(token);

    const session = await HostSession.findOne({
      poolId: req.params.poolId,
      tokenHash,
      expiresAt: {
        $gt: new Date()
      }
    });

    if (!session) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired host authorization"
      });
    }

    next();
  } catch (error) {
    console.error("Host authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Host authorization failed"
    });
  }
};
