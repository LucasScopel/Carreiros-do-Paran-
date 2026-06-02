import { prisma } from "database";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { BadRequestError, UnauthorizedError } from "@/utils/errors";
import CONFIG from "@/config";
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
          Esté link expirará em 24 horas.
        </p>
      </div>
    `,
  });
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

  await sendEmail({
    to: email,

    subject: "Recuperação de senha | Carreiros do Paraná",

    html: `
      <div style="
        font-family: sans-serif;
        line-height: 1.5;
        color: #111;
      ">
        <h2>
          Recuperação de senha
        </h2>

        <p>
          Recebemos uma solicitação para redefinir a senha da sua conta no Carreiros do Paraná.
        </p>

        <p>
          Clique no botão abaixo para criar uma nova senha:
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
            Recuperar senha
          </a>
        </p>

        <p>
          Ou abra esta URL: ${url}
        </p>

        <p>
          Se você não solicitou a redefinição de senha, pode ignorar este email com segurança. Sua senha atual permanecerá inalterada.
        </p>

        <p>
          Este link expirará em 24 horas.
        </p>
      </div>
    `,
  });

  return true;
}
