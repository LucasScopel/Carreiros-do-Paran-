import { Router } from "express";
import * as controller from "./controller";
import requireAuth from "@/middleware/requireAuth";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.post("/logout-all", controller.logoutAll);
router.get("/verify-email", controller.verifyEmail);
router.post(
  "/resend-verification-email",
  requireAuth,
  controller.resendVerificationEmail,
);
router.get("/me", requireAuth, controller.me);

export default router;
