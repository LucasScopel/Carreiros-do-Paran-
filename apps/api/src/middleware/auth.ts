import { prisma } from "database";
import { NextFunction, Request, Response } from "express";
import { hashToken } from "@/utils/tokens";
import CONFIG from "@/config";
import { renewSessionToken } from "@/modules/auth/service";

export default async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies[CONFIG.SESSION_COOKIE];

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

  const now = new Date();

  if (!session || session.expiresAt < now) {
    res.clearCookie(CONFIG.SESSION_COOKIE, CONFIG.SESSION_COOKIE_CONFIG);

    if (session) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });
    }

    return next();
  }

  if (
    session.rememberMe &&
    now.getTime() - session.updatedAt.getTime() >
      CONFIG.SESSION_RENEW_INTERVAL_MS
  ) {
    await renewSessionToken(session.id);
  }

  req.user = session.user;

  next();
}
