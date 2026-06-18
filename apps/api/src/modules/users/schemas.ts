import * as zod from "zod";

// PATCH /users/me
export const updateUserSchema = zod
  .object({
    name: zod.string().trim().min(2).max(100),
    description: zod.string().trim().max(300),
  })
  .partial();
