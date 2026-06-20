import { Router } from "express";
import * as controller from "./controller";
import requireAdmin from "@/middleware/requireAdmin";
import { trailImageUpload } from "./upload";

const router = Router();

router.post("/", requireAdmin, controller.newTrail);
router.patch("/:trailId", requireAdmin, controller.updateTrail);

router.post(
  "/:trailId/images",
  requireAdmin,
  trailImageUpload.array("images", 10),
  controller.uploadTrailImages,
);

router.patch("/:trailId/images", requireAdmin, controller.updateTrailImages);

export default router;
