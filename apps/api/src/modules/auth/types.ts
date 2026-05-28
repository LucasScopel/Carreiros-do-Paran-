import { User } from "database";

export type AuthUser = Pick<
  User,
  "id" | "publicId" | "email" | "emailVerified" | "admin"
>;
