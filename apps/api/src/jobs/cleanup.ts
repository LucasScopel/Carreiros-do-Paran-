import { prisma } from "database";
import { Job } from ".";

/**
 * Job de limpeza periódica do sistema.
 *
 * Remove registros expirados do banco de dados:
 * - Sessões expiradas
 * - Tokens de verificação de email expirados
 * - Tokens de recuperação de senha expirados
 */
export const cleanupJob: Job = {
  interval: 1 * 60 * 60 * 1000, // 1 hour

  async run() {
    console.log("Cleaning expired sessions...");

    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log("Cleaning expired email verification tokens...");

    await prisma.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log("Cleaning expired password reset tokens...");

    await prisma.passwordReset.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  },
};
