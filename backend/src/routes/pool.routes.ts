import { Router } from "express";
import {
  createPool,
  getPoolById,
  cancelPool,
  placeOrder,
  updateDeliveryStatus
} from "../controllers/pool.controller";
import { validate } from "../middleware/validate";
import { createPoolValidator } from "../validators/pool.validator";
import { requireHostToken } from "../middleware/host-auth";

const router = Router();

router.post(
  "/create",
  createPoolValidator,
  validate,
  createPool
);
router.get(
  "/:poolId",
  getPoolById
);
router.post(
  "/:poolId/cancel",
  requireHostToken,
  cancelPool
);
router.post(
  "/:poolId/order",
  requireHostToken,
  placeOrder
);
router.post(
  "/:poolId/delivery-status",
  requireHostToken,
  updateDeliveryStatus
);

export default router;