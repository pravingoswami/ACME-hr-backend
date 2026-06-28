import { PrismaClient } from "@prisma/client";
import { getDatabaseHost, getRuntimeDatabaseUrl } from "./databaseUrl";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = getRuntimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV === "production") {
  console.log(`Prisma using database host: ${getDatabaseHost(databaseUrl)}`);
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
