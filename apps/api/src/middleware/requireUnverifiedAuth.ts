import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@/utils/errors";

export default function (req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  next();
}
