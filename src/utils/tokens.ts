import crypto from "crypto";

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

export function getRefreshTokenExpiry(): Date {
  const days = Number(process.env.REFRESH_TOKEN_DAYS ?? 7);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}
