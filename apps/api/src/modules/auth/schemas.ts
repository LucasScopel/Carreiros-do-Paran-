import * as zod from "zod";

const MIN_BIRTH_DATE = new Date("1900-01-01");

const emailSchema = zod.email().toLowerCase();
const passwordSchema = zod.string().min(6);

export const registerSchema = zod.object({
  email: emailSchema,
  password: passwordSchema,
  name: zod.string().trim().min(2),
  birthDate: zod.iso
    .date()
    .pipe(zod.coerce.date())
    .refine(
      (date) => date >= MIN_BIRTH_DATE && date <= new Date(),
      "Invalid birth date",
    ),
});

export const loginSchema = zod.object({
  email: emailSchema,
  password: zod.string(),
  rememberMe: zod.boolean(),
});

export const verifyEmailSchema = zod.object({
  token: zod.string(),
});

export const forgotPasswordSchema = zod.object({
  email: emailSchema,
});

export const resetPasswordSchema = zod.object({
  token: zod.string(),
  password: passwordSchema,
});

export type RegisterInput = zod.infer<typeof registerSchema>;
export type LoginInput = zod.infer<typeof loginSchema>;
