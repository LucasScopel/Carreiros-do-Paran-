import { NextFunction, Request, Response } from "express";
import { AppError, ForbiddenError, UnauthorizedError } from "../utils/errors";

export default function (req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  if (!req.user.emailVerified) {
    throw new AppError(403, "EMAIL_NOT_VERIFIED", "Email not verified");
  }

  next();
}
