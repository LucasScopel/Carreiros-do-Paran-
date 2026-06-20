import { Router } from "express";
import * as controller from "./controller";
import requireAdmin from "@/middleware/requireAdmin";
import { trailImageUpload } from "./upload";
import CONFIG from "@/config";

const router = Router();

router.get("/", requireAdmin, controller.getAllTrails);
router.get("/:trailId", controller.getTrail);
router.post("/", requireAdmin, controller.newTrail);
router.patch("/:trailId", requireAdmin, controller.updateTrail);
router.delete("/:trailId", requireAdmin, controller.removeTrail);

router.post(
  "/:trailId/images",
  requireAdmin,
  trailImageUpload.array("images", CONFIG.MAX_TRAIL_IMAGE_COUNT),
  controller.uploadTrailImages,
);
router.patch("/:trailId/images", requireAdmin, controller.updateTrailImages);

export default router;
