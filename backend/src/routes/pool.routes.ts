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
  cancelPool
);
router.post(
  "/:poolId/order",
  placeOrder
);
router.post(
  "/:poolId/delivery-status",
  updateDeliveryStatus
);

export default router;