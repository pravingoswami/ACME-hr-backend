import { Prisma, Role, User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/password";
import { CreateUserInput, UpdateUserInput } from "../validators/user.validator";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export async function getAllUsers(): Promise<SafeUser[]> {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function createHrManager(input: CreateUserInput): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new Error("Email already in use");
  }

  const password = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      email: input.email,
      password,
      firstName: input.firstName,
      lastName: input.lastName,
      role: Role.HR_MANAGER,
    },
    select: userSelect,
  });
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<SafeUser> {
  const target = await getUserById(id);

  if (target.role === Role.ADMIN) {
    throw new Error("Admin account cannot be modified");
  }

  if (input.email) {
    const existing = await prisma.user.findFirst({
      where: { email: input.email, NOT: { id } },
    });

    if (existing) {
      throw new Error("Email already in use");
    }
  }

  const data: Prisma.UserUpdateInput = {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    isActive: input.isActive,
  };

  if (input.password) {
    data.password = await hashPassword(input.password);
  }

  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function deleteUser(id: string): Promise<User> {
  const target = await getUserById(id);

  if (target.role === Role.ADMIN) {
    throw new Error("Admin account cannot be deleted");
  }

  return prisma.user.delete({ where: { id } });
}
