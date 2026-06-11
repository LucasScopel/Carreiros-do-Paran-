import { prisma } from "database";
import { NextFunction, Request, Response } from "express";
import { hashToken } from "@/utils/tokens";
import CONFIG from "@/config";
import { renewSessionToken } from "@/modules/auth/service";

/**
 * Middleware de autenticação via sessão.
 *
 * Lê o cookie de sessão, valida no banco e injeta `req.user` quando válido.
 */
export default async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies[CONFIG.SESSION_COOKIE];

  // Sem cookie de sessão: segue como usuário anônimo
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

  // Sessão inválida ou expirada: limpa cookie, remove do banco e segue como anônimo
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

  // Renova a sessão apenas se ela estiver no modo "remember me"
  if (
    session.rememberMe &&
    now.getTime() - session.updatedAt.getTime() >
      CONFIG.SESSION_RENEW_INTERVAL_MS
  ) {
    await renewSessionToken(session.id);
  }

  // Injeta o usuário no request que vai passar para os próximos middlewares e rotas
  req.user = session.user;

  next();
}
