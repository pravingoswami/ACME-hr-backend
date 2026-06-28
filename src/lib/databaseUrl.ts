import dotenv from "dotenv";

dotenv.config();

const SUPABASE_DIRECT_HOST_PATTERN = /db\.[a-z0-9]+\.supabase\.co:5432/i;

export function normalizeDatabaseUrl(rawUrl: string): string {
  const url = new URL(rawUrl);

  if (!url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "require");
  }

  if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true");
  }

  return url.toString();
}

export function getRuntimeDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  return normalizeDatabaseUrl(rawUrl);
}

export function getDatabaseHost(rawUrl: string): string {
  try {
    return new URL(rawUrl).host;
  } catch {
    return "invalid-url";
  }
}

export function isSupabaseDirectConnection(rawUrl: string): boolean {
  return SUPABASE_DIRECT_HOST_PATTERN.test(rawUrl);
}

export function assertProductionDatabaseConfig(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (isSupabaseDirectConnection(databaseUrl)) {
    throw new Error(
      [
        "DATABASE_URL uses a Supabase direct connection (db.*.supabase.co:5432).",
        "Render and most cloud hosts cannot reach that endpoint reliably.",
        "",
        "In Render, set DATABASE_URL to the Supabase Transaction pooler URL, for example:",
        "postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require",
        "",
        "Keep DIRECT_URL as the direct connection for Prisma migrations:",
        "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?sslmode=require",
        "",
        "Find both strings in Supabase: Project Settings -> Database -> Connection string.",
      ].join("\n"),
    );
  }
}
