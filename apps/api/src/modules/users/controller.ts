import { NotFoundError } from "@/utils/errors";
import { Request, Response } from "express";
import { MeResponse } from "shared/types";
import * as usersService from "./service";

/**
 * `GET /users/me`
 *
 * Retorna os dados do usuário autenticado.
 */
export async function me(req: Request, res: Response) {
  // É seguro usar `req.user!.id` aqui pois esse endpoint usa o middleware `requireAuth`
  const user: MeResponse | null = await usersService.getMe(req.user!.id);

  if (user) res.json(user);
  else throw new NotFoundError();
}
