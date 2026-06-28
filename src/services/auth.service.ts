import { prisma } from "../lib/prisma";
import { comparePassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";
import { generateRefreshToken, getRefreshTokenExpiry, hashToken } from "../utils/tokens";
import { getUserById, type SafeUser } from "./user.service";
import { LoginInput } from "../validators/auth.validator";

export interface AuthResult {
  user: SafeUser;
  token: string;
  refreshToken: string;
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !user.isActive) {
    throw new Error("Invalid email or password");
  }

  const isValid = await comparePassword(input.password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const safeUser = await getUserById(user.id);
  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = await issueRefreshToken(user.id);

  return { user: safeUser, token, refreshToken };
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const rawToken = generateRefreshToken();
  const tokenHash = hashToken(rawToken);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return rawToken;
}

export async function refreshSession(refreshToken: string): Promise<AuthResult> {
  const tokenHash = hashToken(refreshToken);

  const stored = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!stored) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });

  if (!user || !user.isActive) {
    throw new Error("Invalid or expired refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const safeUser = await getUserById(user.id);
  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const newRefreshToken = await issueRefreshToken(user.id);

  return { user: safeUser, token, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
