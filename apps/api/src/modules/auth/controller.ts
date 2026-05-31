import { Request, Response } from "express";
import * as authService from "./service";
import { registerSchema, loginSchema } from "./schemas";
import { SESSION_COOKIE, SESSION_COOKIE_CONFIG } from "@/config";
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

  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_CONFIG);

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

  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_CONFIG);

  res.json({
    publicId: user.publicId,
    name: user.name,
  });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies[SESSION_COOKIE];

  if (!token) res.sendStatus(204);

  await authService.logout(token);

  res.clearCookie(SESSION_COOKIE, SESSION_COOKIE_CONFIG);

  res.sendStatus(204);
}

export async function logoutAll(req: Request, res: Response) {
  if (!req.user) res.sendStatus(204);

  await authService.logoutAll(req.user!.id);

  res.clearCookie(SESSION_COOKIE, SESSION_COOKIE_CONFIG);

  res.sendStatus(204);
}

export async function verifyEmail(req: Request, res: Response) {
  const token = req.query.token;

  if (typeof token !== "string")
    throw new BadRequestError("Invalid verification token");

  await authService.verifyEmail(token);

  res.redirect("/");
}

export async function resendVerificationEmail(req: Request, res: Response) {
  await authService.sendEmailVerification(req.user!.id, req.user!.email);

  res.sendStatus(204);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);

  if (user) res.json(user);
  else throw new NotFoundError();
}
