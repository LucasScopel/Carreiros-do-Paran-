import { Router } from "express";
import * as controller from "./controller";
import requireAuth from "@/middleware/requireAuth";
import { avatarUpload } from "./upload";

const router = Router();

router.get("/me", requireAuth, controller.getMe);
router.patch("/me", requireAuth, controller.updateMe);

router.post(
  "/me/avatar",
  requireAuth,
  avatarUpload.single("avatar"),
  controller.uploadAvatar,
);
router.delete("/me/avatar", requireAuth, controller.deleteAvatar);

export default router;
