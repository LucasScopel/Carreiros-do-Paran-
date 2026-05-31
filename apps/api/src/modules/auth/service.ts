import { prisma } from "database";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { BadRequestError, UnauthorizedError } from "@/utils/errors";
import {
  EMAIL_VERIFICATION_TOKEN_EXPIRY_MS,
  SESSION_EXPIRY_MS,
  SESSION_REMEMBER_ME_EXPIRY_MS,
} from "@/config";
import { generateRandomToken, hashToken } from "@/utils/tokens";
import { sendEmail } from "@/utils/email";

async function generateSessionToken(userId: bigint, rememberMe: boolean) {
  const { token, hash } = generateRandomToken();

  await prisma.session.create({
    data: {
      token: hash,
      userId: userId,
      rememberMe: rememberMe,
      expiresAt: new Date(
        Date.now() +
          (rememberMe ? SESSION_REMEMBER_ME_EXPIRY_MS : SESSION_EXPIRY_MS),
      ),
    },
  });

  return token;
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
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: email }],
    },
  });

  if (!user) throw new UnauthorizedError();

  const ok = await argon2.verify(user.password, password);

  if (!ok) throw new UnauthorizedError();

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
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MS),
    },
  });

  const url = `http://${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,

    subject: "Verifique seu email | Carreiros do Paraná",

    html: `
      <div style="
        font-family: sans-serif;
        line-height: 1.5;
        color: #111;
      ">
        <h2>
          Verifique seu email
        </h2>

        <p>
          Seja bem-vindo ao Carreiros do Paraná.
        </p>

        <p>
          Clique abaixo para verificar seu email:
        </p>

        <p>
          <a
            href="${url}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111;
              color: white;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Verificar email
          </a>
        </p>

        <p>
          Ou abra esta URL: ${url}
        </p>

        <p>
          Os links irão expirar em 24 horas.
        </p>
      </div>
    `,
  });
}

export async function getMe(userId: bigint) {
  const user = await prisma.user.findUnique({
    where: { id: userId },

    select: {
      publicId: true,
      email: true,
      name: true,
      admin: true,
      createdAt: true,
      avatarUrl: true,
      birthDate: true,
    },
  });

  return user;
}

export async function renewSessionToken(id: bigint) {
  const newExpiry = new Date(Date.now() + SESSION_REMEMBER_ME_EXPIRY_MS);

  await prisma.session.update({
    data: {
      expiresAt: newExpiry,
    },
    where: {
      id: id,
    },
  });
}
