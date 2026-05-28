import { prisma } from "database";
import { NextFunction, Request, Response } from "express";
import { hashToken } from "@/utils/tokens";
import { SESSION_COOKIE } from "@/config";

export default async function (
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = req.cookies[SESSION_COOKIE];
  if (!token) return next();

  const hash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: {
      token: hash,
    },
    include: {
      user: {
        select: {
          id: true,
          publicId: true,
          email: true,
          emailVerified: true,
          admin: true,
        },
      },
    },
  });

  if (!session) return next();

  req.user = session.user;

  next();
}
