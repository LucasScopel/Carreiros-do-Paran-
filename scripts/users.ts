import { prisma } from "../packages/database";

const COMMANDS: Record<string, () => Promise<void>> = {
  "grant-admin": async () => {
    const email = process.argv[3];

    if (!email) {
      console.error("Usage: pnpm grant-admin <email>");
      process.exit(1);
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        admin: true,
      },
    });

    console.log(`${email} is now an administrator.`);
  },

  "revoke-admin": async () => {
    const email = process.argv[3];

    if (!email) {
      console.error("Usage: pnpm revoke-admin <email>");
      process.exit(1);
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        admin: false,
      },
    });

    console.log(`${email} is not an administrator anymore.`);
  },
};

(async () => {
  try {
    const command = process.argv[2];
    const fn = COMMANDS[command];
    if (fn) await fn();
    else {
      console.log("Unknown command");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
})();
