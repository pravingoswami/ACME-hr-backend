import { prisma } from "../lib/prisma";
import { comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { getUserById, type SafeUser } from "./user.service";
import { LoginInput } from "../validators/auth.validator";

export interface AuthResult {
  user: SafeUser;
  token: string;
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
  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return { user: safeUser, token };
}
