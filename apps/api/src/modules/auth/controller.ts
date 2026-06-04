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
import { BadRequestError, NotFoundError } from "@/utils/errors";

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

  res.json({
    publicId: user.publicId,
    name: user.name,
  });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const { token, user } = await authService.login(
    data.email,
    data.password,
    data.rememberMe,
  );

  res.cookie(CONFIG.SESSION_COOKIE, token, CONFIG.SESSION_COOKIE_CONFIG);

  res.json({
    publicId: user.publicId,
    name: user.name,
  });
}

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

export async function logoutAll(req: Request, res: Response) {
  if (!req.user) {
    res.sendStatus(204);
    return;
  }

  await authService.logoutAll(req.user!.id);

  res.clearCookie(CONFIG.SESSION_COOKIE, CONFIG.SESSION_COOKIE_CONFIG);

  res.sendStatus(204);
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = verifyEmailSchema.parse(req.body);

  await authService.verifyEmail(token);

  res.sendStatus(204);
}

export async function resendVerificationEmail(req: Request, res: Response) {
  if (req.user!.emailVerified) {
    res.sendStatus(204);
    return;
  }

  await authService.sendEmailVerification(req.user!.id, req.user!.email);

  res.sendStatus(204);
}

export async function forgotPassword(req: Request, res: Response) {
  const data = forgotPasswordSchema.parse(req.body);

  // Ignora o resultado para evitar enumeração de emails
  await authService.sendPasswordReset(data.email);

  res.sendStatus(204);
}

export async function resetPassword(req: Request, res: Response) {
  const data = resetPasswordSchema.parse(req.body);

  await authService.resetPassword(data.token, data.password);

  res.sendStatus(204);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);

  if (user) res.json(user);
  else throw new NotFoundError();
}
