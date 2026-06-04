import { Router } from "express";
import * as controller from "./controller";
import requireAuth from "@/middleware/requireAuth";
import requireUnverifiedAuth from "@/middleware/requireUnverifiedAuth";

const router = Router();

router.get("/me", requireAuth, controller.me);

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.post("/logout-all", controller.logoutAll);
router.post("/verify-email", controller.verifyEmail);
router.post(
  "/resend-verification-email",
  requireUnverifiedAuth,
  controller.resendVerificationEmail,
);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);

export default router;
