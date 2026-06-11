import crypto from "crypto";

export function generateRandomToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = hashToken(token);

  return { token, hash };
}

export function hashToken(token: string) {
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  return hash;
}
