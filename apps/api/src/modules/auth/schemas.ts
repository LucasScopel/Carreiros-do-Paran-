import * as zod from "zod";

const MIN_BIRTH_DATE = new Date("1900-01-01");

export const registerSchema = zod.object({
  email: zod.email().toLowerCase(),
  password: zod.string().min(6),
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
  email: zod.email().toLowerCase(),
  password: zod.string(),
  rememberMe: zod.boolean(),
});

export type RegisterInput = zod.infer<typeof registerSchema>;
export type LoginInput = zod.infer<typeof loginSchema>;
