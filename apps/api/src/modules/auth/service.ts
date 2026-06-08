import { prisma } from "database";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { BadRequestError, UnauthorizedError } from "@/utils/errors";
import CONFIG from "@/config";
import { generateRandomToken, hashToken } from "@/utils/tokens";
import { sendEmail } from "@/email";
import { verifyEmailTemplate } from "@/email/verifyEmail";
import { passwordResetTemplate } from "@/email/passwordReset";

async function generateSessionToken(userId: bigint, rememberMe: boolean) {
  const { token, hash } = generateRandomToken();

  await prisma.session.create({
    data: {
      token: hash,
      userId: userId,
      rememberMe: rememberMe,
      expiresAt: new Date(
        Date.now() +
          (rememberMe
            ? CONFIG.SESSION_REMEMBER_ME_EXPIRY_MS
            : CONFIG.SESSION_EXPIRY_MS),
      ),
    },
  });

  return token;
}

async function getUserByEmail(email: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  return user;
}

export async function register(
  name: string,
  email: string,
  password: string,
  birthDate: Date,
) {
  const hash = await argon2.hash(password);

  const publicId = nanoid();

  const user = await prisma.user.create({
    data: {
      publicId,
      email,
      name,
      password: hash,
      birthDate,
    },
  });

  const token = await generateSessionToken(user.id, false);

  return {
    token,
    user,
  };
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  const errorMessage = "Invalid email or password";

  const user = await getUserByEmail(email);
  if (!user) throw new UnauthorizedError(errorMessage);

  const ok = await argon2.verify(user.password, password);
  if (!ok) throw new UnauthorizedError(errorMessage);

  const token = await generateSessionToken(user.id, rememberMe);

  return {
    token,
    user,
  };
}

export async function logout(token: string) {
  const hash = hashToken(token);

  await prisma.session.delete({
    where: {
      token: hash,
    },
  });
}

export async function logoutAll(userId: bigint) {
  await prisma.session.deleteMany({
    where: {
      userId: userId,
    },
  });
}

export async function renewSessionToken(id: bigint) {
  const newExpiry = new Date(Date.now() + CONFIG.SESSION_REMEMBER_ME_EXPIRY_MS);

  await prisma.session.update({
    data: {
      expiresAt: newExpiry,
    },
    where: {
      id: id,
    },
  });
}

export async function verifyEmail(token: string) {
  const hash = hashToken(token);

  const verification = await prisma.emailVerification.findUnique({
    where: { token: hash },
  });

  if (!verification) {
    throw new BadRequestError("Invalid verification token");
  }

  if (verification.expiresAt < new Date()) {
    throw new BadRequestError("Expired verification token");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verification.userId,
      },

      data: {
        emailVerified: true,
      },
    }),

    prisma.emailVerification.delete({
      where: {
        id: verification.id,
      },
    }),
  ]);
}

export async function sendEmailVerification(userId: bigint, email: string) {
  await prisma.emailVerification.deleteMany({
    where: {
      userId: userId,
    },
  });

  const { token, hash } = generateRandomToken();

  await prisma.emailVerification.create({
    data: {
      userId: userId,
      token: hash,
      expiresAt: new Date(
        Date.now() + CONFIG.EMAIL_VERIFICATION_TOKEN_EXPIRY_MS,
      ),
    },
  });

  const url = `${CONFIG.APP_URL}/verify-email?token=${token}`;

  await sendEmail(email, verifyEmailTemplate(url));
}

export async function resetPassword(token: string, password: string) {
  const hash = hashToken(token);

  const verification = await prisma.passwordReset.findUnique({
    where: { token: hash },
  });

  if (!verification) {
    throw new BadRequestError("Invalid token");
  }

  if (verification.expiresAt < new Date()) {
    throw new BadRequestError("Expired token");
  }

  const passwordHash = await argon2.hash(password);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verification.userId,
      },

      data: {
        password: passwordHash,
      },
    }),

    prisma.passwordReset.delete({
      where: {
        id: verification.id,
      },
    }),
  ]);

  await logoutAll(verification.userId);
}

export async function sendPasswordReset(email: string) {
  const user = await getUserByEmail(email);

  if (!user) return false;

  await prisma.passwordReset.deleteMany({
    where: {
      userId: user.id,
    },
  });

  const { token, hash } = generateRandomToken();

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: hash,
      expiresAt: new Date(Date.now() + CONFIG.PASSWORD_RESET_TOKEN_EXPIRY_MS),
    },
  });

  const url = `${CONFIG.APP_URL}/reset-password?token=${token}`;

  await sendEmail(email, passwordResetTemplate(url));

  return true;
}
