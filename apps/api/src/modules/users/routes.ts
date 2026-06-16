import { Router } from "express";
import * as controller from "./controller";
import requireAuth from "@/middleware/requireAuth";

const router = Router();

router.get("/me", requireAuth, controller.getMe);
router.patch("/me", requireAuth, controller.updateMe);

export default router;
