import { BadRequestError, NotFoundError } from "@/utils/errors";
import { Request, Response } from "express";
import { MeResponse } from "shared/types";
import * as usersService from "./service";
import { updateUserSchema } from "./schemas";

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
