import { initializePrisma } from "./prisma";

export async function connectDatabaseWithRetry(): Promise<void> {
  await initializePrisma();
}
