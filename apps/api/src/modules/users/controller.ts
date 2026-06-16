import { BadRequestError, NotFoundError } from "@/utils/errors";
import { Request, Response } from "express";
import { MeResponse } from "shared/types";
import * as usersService from "./service";
import { updateUserSchema } from "./schemas";
import { prisma } from "database";

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
 *
 */
export async function uploadAvatar(req: Request, res: Response) {
  if (!req.file) {
    throw new BadRequestError("Invalid image file");
  }

  await usersService.uploadAvatar(
    req.user!.id,
    req.user!.publicId,
    req.file.buffer,
  );

  res.sendStatus(204);
}

/**
 * `DELETE /users/me/avatar`
 *
 *
 */
export async function deleteAvatar(req: Request, res: Response) {
  res.sendStatus(204);
}
