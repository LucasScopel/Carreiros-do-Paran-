import { Router } from "express";
import * as controller from "./controller";
import requireAuth from "@/middleware/requireAuth";

const router = Router();

router.post("/", requireAuth, controller.newTrail);
router.patch("/", requireAuth, controller.updateTrail);

export default router;
