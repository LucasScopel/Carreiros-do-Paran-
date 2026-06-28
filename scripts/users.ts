import { prisma } from "../packages/database";
import argon2 from "argon2";
import { nanoid } from "nanoid";

const COMMANDS: Record<string, () => Promise<void>> = {
  "grant-admin": async () => {
    const email = process.argv[3];

    if (!email) {
      console.error("Usage: pnpm user grant-admin <email>");
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
      console.error("Usage: pnpm user revoke-admin <email>");
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

  create: async () => {
    const args = process.argv.slice(3);

    const admin = args.includes("--admin");
    const verified = args.includes("--verified");

    const positional = args.filter((arg) => !arg.startsWith("--"));

    let email: string;
    let password: string;
    let name: string;

    if (positional.length === 1) {
      name = positional[0];

      email = `${name}@example.com`;
      password = "123456";
    } else if (positional.length === 2) {
      email = positional[0];
      password = positional[1];

      name = email.split("@")[0];
    } else {
      console.error(
        `Usage:\n\n  pnpm create-user <name> [--admin] [--verified]\n\nor\n\n  pnpm create-user <email> <password> [--admin] [--verified]\n`,
      );

      process.exit(1);
    }

    const hash = await argon2.hash(password);

    const publicId = nanoid();

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          publicId,
          email,
          name,
          password: hash,
          birthDate: new Date("2000-01-01"),
          emailVerified: verified,
          admin: admin,
        },
        select: {
          id: true,
          publicId: true,
          name: true,
          email: true,
          admin: true,
          emailVerified: true,
        },
      });

      const collectionPublicId = nanoid();

      await tx.trailCollection.create({
        data: {
          publicId: collectionPublicId,
          name: "Salvas",
          isDefault: true,
          userId: user.id,
        },
      });

      return user;
    });

    console.log({
      ...user,
      password,
    });
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
