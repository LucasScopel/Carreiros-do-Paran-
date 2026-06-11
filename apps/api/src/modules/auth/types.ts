import { User } from "database";

/**
 * O tipo do objeto injetado no request como `req.user`.
 */
export type AuthUser = Pick<
  User,
  "id" | "publicId" | "email" | "emailVerified" | "admin"
>;
