import { NextFunction, Request, Response } from "express";
import { AppError, ForbiddenError, UnauthorizedError } from "@/utils/errors";

/**
 * Middleware que exige usuário admin.
 *
 * Retorna:
 * - `401 Unauthorized`, caso não exista `req.user`.
 * - `403 Forbidden`, caso o email não esteja verificado.
 * - `403 Forbidden`, caso o usuário não seja admin.
 */
export default function (req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  if (!req.user.emailVerified) {
    throw new AppError(403, "EMAIL_NOT_VERIFIED", "Email not verified");
  }

  if (!req.user!.admin) {
    throw new ForbiddenError();
  }

  next();
}
