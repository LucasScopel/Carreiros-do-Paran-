import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@/utils/errors";

/**
 * Middleware que exige usuário autenticado, mas não
 * necessariamente com email verificado.
 *
 * Retorna `401 Unauthorized` caso não exista `req.user`.
 */
export default function (req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  next();
}
