import { Role } from "@prisma/client";
import { HARDCODED_ADMIN } from "../config/admin";
import { hashPassword } from "../utils/password";
import { prisma } from "./prisma";

export async function seedAdmin() {
  const password = await hashPassword(HARDCODED_ADMIN.password);

  await prisma.user.upsert({
    where: { email: HARDCODED_ADMIN.email },
    update: {
      password,
      firstName: HARDCODED_ADMIN.firstName,
      lastName: HARDCODED_ADMIN.lastName,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email: HARDCODED_ADMIN.email,
      password,
      firstName: HARDCODED_ADMIN.firstName,
      lastName: HARDCODED_ADMIN.lastName,
      role: Role.ADMIN,
    },
  });

  console.log(`Hardcoded admin ready: ${HARDCODED_ADMIN.email}`);
}
