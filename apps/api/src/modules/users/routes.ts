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
router.get("/:userId", controller.get);
router.get("/:userId/reviews", controller.getReviews);

// Criar, atualizar, recuperar e deletar Coleções de Trilhas
router.get("/me/collections", requireAuth, controller.getMyCollections);
router.post("/me/collections", requireAuth, controller.createCollection);
router.patch(
  "/me/collections/:collectionId",
  requireAuth,
  controller.updateCollection,
);
router.delete(
  "/me/collections/:collectionId",
  requireAuth,
  controller.deleteCollection,
);

// Adicionar, remover e recuperar trilhas em coleções
router.get(
  "/me/collections/:collectionId/trails",
  requireAuth,
  controller.getMyCollectionTrails,
);
router.put(
  "/me/collections/:collectionId/:trailId",
  requireAuth,
  controller.upsertCollectionTrail,
);
router.delete(
  "/me/collections/:collectionId/:trailId",
  requireAuth,
  controller.deleteCollectionTrail,
);
router.get(
  "/me/trails/:trailId/collections",
  requireAuth,
  controller.getCollectionsContainingTrail,
);

// Recuperar coleções de trilhas de outros usuários
router.get("/:userId/collections", controller.getUserCollections);
router.get(
  "/:userId/collections/:collectionId/trails",
  controller.getUserCollectionTrails,
);

// Amizades
router.post("/me/friends", requireAuth, controller.addFriend);
router.delete("/me/friends/:userId", requireAuth, controller.removeFriend);
router.get("/me/friends", requireAuth, controller.getFriends);
router.get(
  "/me/friends/requests/received",
  requireAuth,
  controller.getReceivedFriendRequests,
);
router.get(
  "/me/friends/requests/sent",
  requireAuth,
  controller.getSentFriendRequests,
);
router.get("/:userId/friends", controller.getUserFriends);

export default router;
