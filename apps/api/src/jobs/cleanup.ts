import { prisma } from "database";
import { Job } from ".";

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
  },
};
