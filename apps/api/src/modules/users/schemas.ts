import * as zod from "zod";

const visibilityLevelSchema = zod.enum([
  "PUBLIC",
  "FRIENDS",
  "PRIVATE",
] as const);

// PATCH /users/me
export const updateUserSchema = zod
  .object({
    name: zod.string().trim().min(2).max(100),
    description: zod.string().trim().max(300),
    reviewsVisibility: visibilityLevelSchema,
  })
  .partial();

export const createTrailCollectionSchema = zod.object({
  name: zod.string().trim().min(2).max(50),
  visibility: visibilityLevelSchema,
});

export const updateTrailCollectionSchema =
  createTrailCollectionSchema.partial();

export const addFriendSchema = zod.object({
  friendId: zod.nanoid(),
});
