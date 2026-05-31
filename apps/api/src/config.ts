export const SESSION_EXPIRY_MS = 1 * 24 * 60 * 60 * 1000; // 1 day
export const SESSION_REMEMBER_ME_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_RENEW_INTERVAL_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
export const SESSION_COOKIE = "sid" as const;
export const SESSION_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export const EMAIL_VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 day
