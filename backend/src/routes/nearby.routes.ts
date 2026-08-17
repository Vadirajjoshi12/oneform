import { Router } from "express";
import { getNearbyPools } from "../controllers/nearby.controller";

const router = Router();

router.get("/", getNearbyPools);

export default router;