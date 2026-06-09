import { NextFunction, Request, Response } from "express";
import { AppError, UnauthorizedError } from "@/utils/errors";

/**
 * Middleware que exige usuário autenticado.
 *
 * Retorna:
 * - `401 Unauthorized`, caso não exista `req.user`.
 * - `403 Forbidden`, caso o email não esteja verificado.
 */
export default function (req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  if (!req.user.emailVerified) {
    throw new AppError(403, "EMAIL_NOT_VERIFIED", "Email not verified");
  }

  next();
}
