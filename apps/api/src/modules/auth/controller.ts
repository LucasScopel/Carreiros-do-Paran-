import { Request, Response } from "express";
import * as authService from "./service";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./schemas";
import CONFIG from "@/config";

/**
 * `POST /auth/register`
 *
 * Cria uma nova conta e inicia uma sessão.
 */
export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const { token, user } = await authService.register(
    data.name,
    data.email,
    data.password,
    data.birthDate,
  );

  await authService.sendEmailVerification(user.id, user.email);

  res.cookie(CONFIG.SESSION_COOKIE, token, CONFIG.SESSION_COOKIE_CONFIG);

  res.send(204);
}

/**
 * `POST /auth/login`
 *
 * Autentica o usuário e cria uma nova sessão.
 */
export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const { token } = await authService.login(
    data.email,
    data.password,
    data.rememberMe,
  );

  res.cookie(CONFIG.SESSION_COOKIE, token, CONFIG.SESSION_COOKIE_CONFIG);

  res.send(204);
}

/**
 * `POST /auth/logout`
 *
 * Encerra a sessão atual e limpa o cookie de sessão.
 */
export async function logout(req: Request, res: Response) {
  const token = req.cookies[CONFIG.SESSION_COOKIE];

  if (!token) {
    res.sendStatus(204);
    return;
  }

  await authService.logout(token);

  res.clearCookie(CONFIG.SESSION_COOKIE, CONFIG.SESSION_COOKIE_CONFIG);

  res.sendStatus(204);
}

/**
 * `POST /auth/logout-all`
 *
 * Encerra todas as sessões ativas do usuário e limpa o cookie de sessão.
 */
export async function logoutAll(req: Request, res: Response) {
  if (!req.user) {
    res.sendStatus(204);
    return;
  }

  await authService.logoutAll(req.user!.id);

  res.clearCookie(CONFIG.SESSION_COOKIE, CONFIG.SESSION_COOKIE_CONFIG);

  res.sendStatus(204);
}

/**
 * `POST /auth/verify-email`
 *
 * Confirma o endereço de email utilizando um token de verificação.
 */
export async function verifyEmail(req: Request, res: Response) {
  const { token } = verifyEmailSchema.parse(req.body);

  await authService.verifyEmail(token);

  res.sendStatus(204);
}

/**
 * `POST /auth/resend-verification-email`
 *
 * Gera e envia um novo email de verificação.
 */
export async function resendVerificationEmail(req: Request, res: Response) {
  if (req.user!.emailVerified) {
    res.sendStatus(204);
    return;
  }

  await authService.sendEmailVerification(req.user!.id, req.user!.email);

  res.sendStatus(204);
}

/**
 * `POST /auth/forgot-password`
 *
 * Inicia o fluxo de recuperação de senha.
 */
export async function forgotPassword(req: Request, res: Response) {
  const data = forgotPasswordSchema.parse(req.body);

  // Ignora o resultado para evitar enumeração de emails
  await authService.sendPasswordReset(data.email);

  res.sendStatus(204);
}

/**
 * `POST /auth/reset-password`
 *
 * Define uma nova senha utilizando um token de recuperação.
 */
export async function resetPassword(req: Request, res: Response) {
  const data = resetPasswordSchema.parse(req.body);

  await authService.resetPassword(data.token, data.password);

  res.sendStatus(204);
}
