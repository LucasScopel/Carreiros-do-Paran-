export const SESSION_IDLE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_COOKIE = "sid" as const;
export const SESSION_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export const EMAIL_VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 days
