import * as zod from "zod";

const visibilityLevelSchema = ["PUBLIC", "FRIENDS", "PRIVATE"] as const;

// PATCH /users/me
export const updateUserSchema = zod
  .object({
    name: zod.string().trim().min(2).max(100),
    description: zod.string().trim().max(300),
    reviewsVisibility: zod.enum(visibilityLevelSchema),
  })
  .partial();
