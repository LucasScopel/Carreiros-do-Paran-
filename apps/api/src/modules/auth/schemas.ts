import * as zod from "zod";

const MIN_BIRTH_DATE = new Date("1900-01-01");

// Regras compartilhadas entre vários schemas.
const emailSchema = zod.email().toLowerCase();
const passwordSchema = zod.string().min(6);

// POST /auth/register
export const registerSchema = zod.object({
  email: emailSchema,
  password: passwordSchema,
  name: zod.string().trim().min(2).max(100),
  birthDate: zod.iso
    .date()
    .transform((date) => new Date(`${date}T12:00:00`))
    .refine(
      (date) => date >= MIN_BIRTH_DATE && date <= new Date(),
      "Invalid birth date",
    ),
});

// POST /auth/login
export const loginSchema = zod.object({
  email: emailSchema,
  password: zod.string(),
  rememberMe: zod.boolean(),
});

// POST /auth/verify-email
export const verifyEmailSchema = zod.object({
  token: zod.string(),
});

// POST /auth/forgot-password
export const forgotPasswordSchema = zod.object({
  email: emailSchema,
});

// POST /auth/reset-password
export const resetPasswordSchema = zod.object({
  token: zod.string(),
  password: passwordSchema,
});
