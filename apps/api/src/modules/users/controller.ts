import { NotFoundError } from "@/utils/errors";
import { Request, Response } from "express";
import { MeResponse } from "shared/types";
import * as usersService from "./service";

export async function me(req: Request, res: Response) {
  const user: MeResponse | null = await usersService.getMe(req.user!.id);

  if (user) res.json(user);
  else throw new NotFoundError();
}
