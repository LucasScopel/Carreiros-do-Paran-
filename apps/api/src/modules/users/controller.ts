import { NotFoundError } from "@/utils/errors";
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

  res.send(204);
}
