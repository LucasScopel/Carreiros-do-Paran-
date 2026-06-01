export const APP_CONFIG = {
  IS_PROD: process.env.NODE_ENV === "production",

  SESSION_EXPIRY_MS: 1 * 24 * 60 * 60 * 1000,
  SESSION_REMEMBER_ME_EXPIRY_MS: 30 * 24 * 60 * 60 * 1000,
  SESSION_RENEW_INTERVAL_MS: 2 * 24 * 60 * 60 * 1000,
  SESSION_COOKIE: "sid" as const,
  SESSION_COOKIE_CONFIG: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",

    sameSite: "lax" as const,
  },

  EMAIL_VERIFICATION_TOKEN_EXPIRY_MS: 24 * 60 * 60 * 1000,
};

export default APP_CONFIG;
