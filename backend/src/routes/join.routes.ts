import { Router } from "express";

import {
  joinPool,
  leavePool
} from "../controllers/join.controller";

import { joinPoolValidator } from "../validators/join.validator";

import { validate } from "../middleware/validate";

const router = Router();

router.post(
  "/:poolId/join",
  joinPoolValidator,
  validate,
  joinPool
);

router.post(
  "/:poolId/leave",
  leavePool
);

export default router;