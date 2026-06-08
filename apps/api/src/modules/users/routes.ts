import { Router } from "express";
import * as controller from "./controller";
import requireAuth from "@/middleware/requireAuth";

const router = Router();

router.get("/me", requireAuth, controller.me);

export default router;
