import { prisma } from "./prisma";
import { getDatabaseConnectionHelp } from "./databaseUrl";

const DEFAULT_MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDatabaseWithRetry(
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;

      if (attempt > 1) {
        console.log(`Connected to PostgreSQL on attempt ${attempt}`);
      }

      return;
    } catch (error) {
      lastError = error;
      console.error(`Database connection attempt ${attempt}/${maxAttempts} failed`);

      if (attempt < maxAttempts) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(
    `Could not connect to PostgreSQL after ${maxAttempts} attempts.\n${getDatabaseConnectionHelp()}`,
    { cause: lastError instanceof Error ? lastError : undefined },
  );
}
