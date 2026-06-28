import dotenv from "dotenv";
import { SUPABASE_PROJECT } from "../config/supabase";

dotenv.config();

export type DatabaseUrlSource =
  | "pooler-env"
  | "session-pooler"
  | "transaction-pooler"
  | "direct";

export function normalizeDatabaseUrl(rawUrl: string): string {
  const url = new URL(rawUrl);

  if (!url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "require");
  }

  const isTransactionPooler =
    url.port === "6543" || url.searchParams.get("pgbouncer") === "true";

  if (isTransactionPooler && !url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true");
  }

  return url.toString();
}

export function getDatabaseHost(rawUrl: string): string {
  try {
    return new URL(rawUrl).host;
  } catch {
    return "invalid-url";
  }
}

export function getSupabaseProjectRef(): string | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl) {
    const refMatch = supabaseUrl.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
    if (refMatch) {
      return refMatch[1];
    }
  }

  for (const jwt of [process.env.SUPABASE_ANON_KEY, process.env.SUPABASE_SERVICE_ROLE_KEY]) {
    if (!jwt) {
      continue;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(jwt.split(".")[1] ?? "", "base64url").toString("utf8"),
      ) as { ref?: string };

      if (payload.ref) {
        return payload.ref;
      }
    } catch {
      // ignore invalid JWT segments
    }
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      return extractSupabaseProjectRef(new URL(databaseUrl));
    } catch {
      return null;
    }
  }

  if (isProductionLike()) {
    return SUPABASE_PROJECT.ref;
  }

  return null;
}

function extractSupabaseProjectRef(url: URL): string | null {
  const hostMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
  if (hostMatch) {
    return hostMatch[1];
  }

  const userMatch = url.username.match(/^postgres\.([a-z0-9]+)$/i);
  if (userMatch) {
    return userMatch[1];
  }

  return getSupabaseProjectRef();
}

function getSupabaseRegion(): string | null {
  const fromEnv = process.env.SUPABASE_REGION ?? process.env.SUPABASE_DB_REGION;
  if (fromEnv) {
    return fromEnv;
  }

  if (isProductionLike()) {
    return SUPABASE_PROJECT.region;
  }

  return null;
}

function isProductionLike(): boolean {
  return process.env.NODE_ENV === "production" || process.env.RENDER === "true";
}

export function isSupabaseDirectConnection(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const isDirectHost = /^db\.[a-z0-9]+\.supabase\.co$/i.test(url.hostname);
    const port = url.port || "5432";
    return isDirectHost && port === "5432";
  } catch {
    return /db\.[a-z0-9]+\.supabase\.co:5432/i.test(rawUrl);
  }
}

function getPoolerHosts(region: string): string[] {
  const hosts = new Set<string>();

  if (process.env.SUPABASE_POOLER_HOST) {
    hosts.add(process.env.SUPABASE_POOLER_HOST);
  }

  hosts.add(SUPABASE_PROJECT.poolerHost);
  hosts.add(`aws-0-${region}.pooler.supabase.com`);
  hosts.add(`aws-1-${region}.pooler.supabase.com`);

  return [...hosts];
}

function buildSharedPoolerUrl(
  directUrl: string,
  projectRef: string,
  poolerHost: string,
  mode: "session" | "transaction",
): string {
  const source = new URL(directUrl);
  const pooler = new URL("postgresql://localhost/postgres");
  pooler.username = `postgres.${projectRef}`;
  pooler.password = source.password;
  pooler.hostname = poolerHost;
  pooler.port = mode === "session" ? "5432" : "6543";
  pooler.pathname = source.pathname || "/postgres";
  pooler.searchParams.set("sslmode", "require");

  if (mode === "transaction") {
    pooler.searchParams.set("pgbouncer", "true");
  }

  return pooler.toString();
}

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

export function getDatabaseConnectionHelp(): string {
  const projectRef = getSupabaseProjectRef() ?? "[project-ref]";

  return [
    "Render cannot reach Supabase direct connections (db.*.supabase.co:5432).",
    "",
    "Add these environment variables on Render:",
    "",
    "Option A (recommended):",
    `  SUPABASE_REGION=${SUPABASE_PROJECT.region}`,
    "  DATABASE_URL=<keep your existing direct Supabase URL>",
    "  DIRECT_URL=<same direct URL>",
    "",
    "Option B (copy from Supabase -> Connect -> Transaction pooler):",
    `  DATABASE_POOLER_URL=postgresql://postgres.${projectRef}:[password]@${SUPABASE_PROJECT.poolerHost}:6543/postgres?pgbouncer=true&sslmode=require`,
    "",
    "Also ensure the Supabase project is not paused.",
  ].join("\n");
}

export function getDatabaseUrlCandidates(): string[] {
  if (process.env.DATABASE_POOLER_URL) {
    return [normalizeDatabaseUrl(process.env.DATABASE_POOLER_URL)];
  }

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new DatabaseConfigurationError("DATABASE_URL is not configured");
  }

  if (!isProductionLike() || !isSupabaseDirectConnection(rawUrl)) {
    return [normalizeDatabaseUrl(rawUrl)];
  }

  const region = getSupabaseRegion();
  if (!region) {
    throw new DatabaseConfigurationError(getDatabaseConnectionHelp());
  }

  const projectRef = extractSupabaseProjectRef(new URL(rawUrl));
  if (!projectRef) {
    throw new DatabaseConfigurationError(
      "Could not determine Supabase project ref. Set SUPABASE_URL or SUPABASE_ANON_KEY on Render.",
    );
  }

  const candidates: string[] = [];

  for (const host of getPoolerHosts(region)) {
    candidates.push(
      buildSharedPoolerUrl(rawUrl, projectRef, host, "transaction"),
      buildSharedPoolerUrl(rawUrl, projectRef, host, "session"),
    );
  }

  return candidates;
}

export function resolveRuntimeDatabaseUrl(): { url: string; source: DatabaseUrlSource } {
  const candidates = getDatabaseUrlCandidates();
  const url = candidates[0];

  if (process.env.DATABASE_POOLER_URL) {
    return { url, source: "pooler-env" };
  }

  if (!isProductionLike() || !isSupabaseDirectConnection(process.env.DATABASE_URL ?? "")) {
    return { url, source: "direct" };
  }

  if (new URL(url).port === "6543") {
    return { url, source: "transaction-pooler" };
  }

  return { url, source: "session-pooler" };
}

export function getRuntimeDatabaseUrl(): string {
  return resolveRuntimeDatabaseUrl().url;
}

export function logDatabaseConnectionMode(url: string, source: DatabaseUrlSource): void {
  const host = getDatabaseHost(url);

  if (source === "pooler-env") {
    console.log(`Using DATABASE_POOLER_URL host: ${host}`);
    return;
  }

  if (source === "session-pooler") {
    console.log(`Using Supabase session pooler host: ${host}`);
    return;
  }

  if (source === "transaction-pooler") {
    console.log(`Using Supabase transaction pooler host: ${host}`);
    return;
  }

  console.log(`Prisma using database host: ${host}`);
}
