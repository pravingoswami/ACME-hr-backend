import { PrismaClient } from "@prisma/client";
import {
  DatabaseConfigurationError,
  getDatabaseConnectionHelp,
  getDatabaseHost,
  getDatabaseUrlCandidates,
  logDatabaseConnectionMode,
  type DatabaseUrlSource,
} from "./databaseUrl";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClient: PrismaClient | null = null;
let activeDatabaseSource: DatabaseUrlSource = "direct";

function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function resolveSourceForUrl(url: string): DatabaseUrlSource {
  if (process.env.DATABASE_POOLER_URL) {
    return "pooler-env";
  }

  const host = new URL(url).hostname;
  if (host.includes("pooler.supabase.com")) {
    return new URL(url).port === "6543" ? "transaction-pooler" : "session-pooler";
  }

  return "direct";
}

export async function initializePrisma(): Promise<PrismaClient> {
  if (prismaClient) {
    return prismaClient;
  }

  let candidates: string[];

  try {
    candidates = getDatabaseUrlCandidates();
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) {
      throw error;
    }

    throw new DatabaseConfigurationError(getDatabaseConnectionHelp());
  }

  const errors: Error[] = [];

  for (const candidateUrl of candidates) {
    const source = resolveSourceForUrl(candidateUrl);
    console.log(`Trying database host: ${getDatabaseHost(candidateUrl)}`);

    const candidateClient = createPrismaClient(candidateUrl);

    try {
      await candidateClient.$connect();
      await candidateClient.$queryRaw`SELECT 1`;

      prismaClient = candidateClient;
      activeDatabaseSource = source;
      logDatabaseConnectionMode(candidateUrl, source);

      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaClient;
      }

      return prismaClient;
    } catch (error) {
      errors.push(
        error instanceof Error
          ? error
          : new Error(`Failed to connect to ${getDatabaseHost(candidateUrl)}`),
      );
      await candidateClient.$disconnect().catch(() => undefined);
    }
  }

  throw new Error(
    `Could not connect to PostgreSQL using any configured Supabase pooler URL.\n${getDatabaseConnectionHelp()}`,
    { cause: errors[0] },
  );
}

export function getActiveDatabaseSource(): DatabaseUrlSource {
  return activeDatabaseSource;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    if (!prismaClient) {
      throw new Error("Prisma client is not initialized. Call initializePrisma() during startup.");
    }

    const value = Reflect.get(prismaClient, property, receiver);
    return typeof value === "function" ? value.bind(prismaClient) : value;
  },
});

if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma) {
  prismaClient = globalForPrisma.prisma;
}
