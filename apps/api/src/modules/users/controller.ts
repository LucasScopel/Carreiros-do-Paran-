import { BadRequestError, NotFoundError } from "@/utils/errors";
import { Request, Response } from "express";
import { MeResponse } from "shared/types";
import * as usersService from "./service";
import {
  addFriendSchema,
  createTrailCollectionSchema,
  updateTrailCollectionSchema,
  updateUserSchema,
} from "./schemas";
import { getIntegerQueryParam, ParamsDictionary } from "@/utils/params";
import CONFIG from "@/config";

function getCollectionIdParam(params: ParamsDictionary) {
  if (!params.collectionId) {
    throw new BadRequestError("Missing collection id");
  }
  return params.collectionId as string;
}

function getTrailIdParam(params: ParamsDictionary) {
  if (!params.trailId) {
    throw new BadRequestError("Missing trail id");
  }
  return params.trailId as string;
}

function getUserIdParam(params: ParamsDictionary) {
  if (!params.userId) {
    throw new BadRequestError("Missing user id");
  }
  return params.userId as string;
}

/**
 * `GET /users/me`
 *
 * Retorna os dados do usuário autenticado.
 */
export async function getMe(req: Request, res: Response) {
  // É seguro usar `req.user!.id` aqui pois esse endpoint usa o middleware `requireAuth`
  const user: MeResponse | null = await usersService.getMe(req.user!.id);

  if (user) res.json(user);
  else throw new NotFoundError();
}

/**
 * `PATCH /users/me`
 *
 * Atualiza os dados do usuário autenticado.
 */
export async function updateMe(req: Request, res: Response) {
  const data = updateUserSchema.parse(req.body);

  await usersService.updateUser(req.user!.id, data);

  res.sendStatus(204);
}

/**
 * `POST /users/me/avatar`
 *
 * Recebe um upload de imagem e usa ela como
 * foto de perfil do usuário autenticado.
 *
 * Retorna `400 Bad Request` para imagens inválidas
 * ou pequenas demais.
 */
export async function uploadAvatar(req: Request, res: Response) {
  if (!req.file) {
    throw new BadRequestError("Invalid image file");
  }

  await usersService.uploadAvatar(req.user!.publicId, req.file.buffer);

  await usersService.updateAvatarVersion(req.user!.id);

  res.sendStatus(204);
}

/**
 * `DELETE /users/me/avatar`
 *
 * Remove a foto de perfil do usuário autenticado.
 */
export async function deleteAvatar(req: Request, res: Response) {
  await usersService.removeAvatar(req.user!.id, req.user!.publicId);

  res.sendStatus(204);
}

export async function get(req: Request, res: Response) {
  const userId = getUserIdParam(req.params);

  const user = await usersService.get(req.user?.id ?? null, userId);

  res.send(user);
}

export async function getReviews(req: Request, res: Response) {
  const userId = getUserIdParam(req.params);

  const reviews = await usersService.getReviews(userId, req.user?.id);

  res.json(reviews);
}

export async function getMyCollections(req: Request, res: Response) {
  const collections = await usersService.getMyCollections(req.user!.id);

  res.json(collections);
}

export async function createCollection(req: Request, res: Response) {
  const data = createTrailCollectionSchema.parse(req.body);

  const collectionId = await usersService.createCollection(req.user!.id, data);

  res.status(201).json({ publicId: collectionId });
}

export async function updateCollection(req: Request, res: Response) {
  const collectionId = getCollectionIdParam(req.params);
  const data = updateTrailCollectionSchema.parse(req.body);

  await usersService.updateCollection(req.user!.id, collectionId, data);

  res.sendStatus(204);
}

export async function deleteCollection(req: Request, res: Response) {
  const collectionId = getCollectionIdParam(req.params);

  await usersService.deleteCollection(req.user!.id, collectionId);

  res.sendStatus(204);
}

export async function getMyCollectionTrails(req: Request, res: Response) {
  const collectionId = getCollectionIdParam(req.params);
  const cursor = getIntegerQueryParam(req.query, "cursor", {
    default: null,
  });
  const limit = getIntegerQueryParam(req.query, "limit", {
    max: CONFIG.MAX_COLLECTION_TRAIL_COUNT,
    default: 5,
  });

  const data = await usersService.getMyCollectionTrails(
    req.user!.id,
    collectionId,
    {
      cursor: cursor,
      limit: limit,
    },
  );

  res.json(data);
}

export async function upsertCollectionTrail(req: Request, res: Response) {
  const collectionId = getCollectionIdParam(req.params);
  const trailId = getTrailIdParam(req.params);

  await usersService.upsertCollectionTrail(req.user!.id, collectionId, trailId);

  res.sendStatus(204);
}

export async function deleteCollectionTrail(req: Request, res: Response) {
  const collectionId = getCollectionIdParam(req.params);
  const trailId = getTrailIdParam(req.params);

  await usersService.removeTrailFromCollection(
    req.user!.id,
    collectionId,
    trailId,
  );

  res.sendStatus(204);
}

export async function getCollectionsContainingTrail(
  req: Request,
  res: Response,
) {
  const trailId = getTrailIdParam(req.params);

  const collections = await usersService.getCollectionsContainingTrail(
    req.user!.id,
    trailId,
  );

  res.json(collections);
}

export async function getUserCollections(req: Request, res: Response) {
  const userId = getUserIdParam(req.params);

  const collections = await usersService.getUserCollections(
    req.user?.id ?? null,
    userId,
  );

  res.json(collections);
}

export async function getUserCollectionTrails(req: Request, res: Response) {
  const userId = getUserIdParam(req.params);
  const collectionId = getCollectionIdParam(req.params);
  const cursor = getIntegerQueryParam(req.query, "cursor", {
    default: null,
  });
  const limit = getIntegerQueryParam(req.query, "limit", {
    max: CONFIG.MAX_COLLECTION_TRAIL_COUNT,
    default: 5,
  });

  const data = await usersService.getUserCollectionTrails(
    req.user?.id ?? null,
    userId,
    collectionId,
    {
      cursor: cursor,
      limit: limit,
    },
  );

  res.json(data);
}

export async function addFriend(req: Request, res: Response) {
  const { friendId } = addFriendSchema.parse(req.body);

  const result = await usersService.addFriend(req.user!.id, friendId);

  res.status(result === "sent-request" ? 201 : 200).json({});
}

export async function removeFriend(req: Request, res: Response) {
  const friendId = getUserIdParam(req.params);

  const result = await usersService.removeFriend(req.user!.id, friendId);

  res.status(200).json({ message: result });
}

export async function getFriends(req: Request, res: Response) {
  const cursor = getIntegerQueryParam(req.query, "cursor", {
    default: null,
  });
  const limit = getIntegerQueryParam(req.query, "limit", {
    max: CONFIG.MAX_COLLECTION_TRAIL_COUNT,
    default: 5,
  });

  const data = await usersService.getFriends(req.user!.id, {
    cursor,
    limit,
  });

  res.json(data);
}

export async function getReceivedFriendRequests(req: Request, res: Response) {
  const cursor = getIntegerQueryParam(req.query, "cursor", {
    default: null,
  });
  const limit = getIntegerQueryParam(req.query, "limit", {
    max: CONFIG.MAX_COLLECTION_TRAIL_COUNT,
    default: 5,
  });

  const data = await usersService.getReceivedFriendRequests(req.user!.id, {
    cursor: cursor,
    limit: limit,
  });

  res.json(data);
}

export async function getSentFriendRequests(req: Request, res: Response) {
  const cursor = getIntegerQueryParam(req.query, "cursor", {
    default: null,
  });
  const limit = getIntegerQueryParam(req.query, "limit", {
    max: CONFIG.MAX_COLLECTION_TRAIL_COUNT,
    default: 5,
  });

  const data = await usersService.getSentFriendRequests(req.user!.id, {
    cursor: cursor,
    limit: limit,
  });

  res.json(data);
}

export async function getUserFriends(req: Request, res: Response) {
  const userId = getUserIdParam(req.params);
  const cursor = getIntegerQueryParam(req.query, "cursor", {
    default: null,
  });
  const limit = getIntegerQueryParam(req.query, "limit", {
    max: CONFIG.MAX_COLLECTION_TRAIL_COUNT,
    default: 5,
  });

  const data = await usersService.getUserFriends(req.user?.id ?? null, userId, {
    cursor: cursor,
    limit: limit,
  });

  res.json(data);
}
