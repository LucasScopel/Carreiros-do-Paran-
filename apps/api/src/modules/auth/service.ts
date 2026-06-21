import { prisma } from "database";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { BadRequestError, UnauthorizedError } from "@/utils/errors";
import CONFIG from "@/config";
import { generateRandomToken, hashToken } from "@/utils/tokens";
import { sendEmail } from "@/email";
import { verifyEmailTemplate } from "@/email/verifyEmail";
import { passwordResetTemplate } from "@/email/passwordReset";

/**
 * Cria uma nova sessão para o usuário e retorna o token em texto puro.
 *
 * Apenas o hash do token é armazenado no banco.
 */
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

/** Busca um usuário pelo email. */
async function getUserByEmail(email: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  return user;
}

/**
 * Registra um novo usuário e cria sua primeira sessão.
 */
export async function register(
  name: string,
  email: string,
  password: string,
  birthDate: Date,
) {
  // Nunca armazenamos a senha em texto puro.
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

/**
 * Autentica um usuário e cria uma nova sessão.
 */
export async function login(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  const errorMessage = "Incorrect e-mail or password";

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

/**
 * Encerra a sessão correspondente ao token passado.
 */
export async function logout(token: string) {
  const hash = hashToken(token);

  await prisma.session.delete({
    where: {
      token: hash,
    },
  });
}

/**
 * Encerra todas as sessões ativas do usuário.
 */
export async function logoutAll(userId: bigint) {
  await prisma.session.deleteMany({
    where: {
      userId: userId,
    },
  });
}

/**
 * Renova a validade de uma sessão persistente ("remember me").
 */
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

/**
 * Confirma o email do usuário a partir de um token de verificação válido.
 */
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

  // Marca o email como verificado e remove o token utilizado.
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

/**
 * Gera um token de verificação de email e o envia para o usuário.
 */
export async function sendEmailVerification(userId: bigint, email: string) {
  // Garante que há apenas um token de verificação para este usuário.
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

/**
 * Redefine uma senha utilizando um token de recuperação válido.
 */
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

  // Atualiza a senha e invalida o token de recuperação.
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

  // Invalida todas as sessões após a troca de senha.
  await logoutAll(verification.userId);
}

/**
 * Envia um email de recuperação de senha para o usuário.
 *
 * Retorna `false` quando o email não existe, `true` caso contrário.
 */
export async function sendPasswordReset(email: string) {
  const user = await getUserByEmail(email);

  if (!user) return false;

  // Garante que há apenas um token de recuperação para este usuário.
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

  const url = `${CONFIG.APP_URL}/forgot-password?token=${token}`;

  await sendEmail(email, passwordResetTemplate(url));

  return true;
}
