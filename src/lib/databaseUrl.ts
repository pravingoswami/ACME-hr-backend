import dotenv from "dotenv";

dotenv.config();

export function normalizeDatabaseUrl(rawUrl: string): string {
  const url = new URL(rawUrl);

  if (!url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "require");
  }

  const isTransactionPooler =
    url.port === "6543" ||
    url.searchParams.get("pgbouncer") === "true";

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

function extractSupabaseProjectRef(url: URL): string | null {
  const hostMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
  if (hostMatch) {
    return hostMatch[1];
  }

  const userMatch = url.username.match(/^postgres\.([a-z0-9]+)$/i);
  if (userMatch) {
    return userMatch[1];
  }

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

  return null;
}

function getSupabaseRegion(): string | null {
  return process.env.SUPABASE_REGION ?? process.env.SUPABASE_DB_REGION ?? null;
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

function convertDirectToSharedSessionPooler(directUrl: string, region: string): string | null {
  const source = new URL(directUrl);
  const projectRef = extractSupabaseProjectRef(source);

  if (!projectRef) {
    return null;
  }

  const pooler = new URL("postgresql://localhost/postgres");
  pooler.username = `postgres.${projectRef}`;
  pooler.password = source.password;
  pooler.hostname = `aws-0-${region}.pooler.supabase.com`;
  pooler.port = "5432";
  pooler.pathname = source.pathname || "/postgres";
  pooler.searchParams.set("sslmode", "require");

  return pooler.toString();
}

function convertDirectToDedicatedPooler(directUrl: string): string | null {
  const source = new URL(directUrl);
  const projectRef = extractSupabaseProjectRef(source);

  if (!projectRef) {
    return null;
  }

  const pooler = new URL("postgresql://localhost/postgres");
  pooler.username = `postgres.${projectRef}`;
  pooler.password = source.password;
  pooler.hostname = `db.${projectRef}.supabase.co`;
  pooler.port = "6543";
  pooler.pathname = source.pathname || "/postgres";
  pooler.searchParams.set("sslmode", "require");
  pooler.searchParams.set("pgbouncer", "true");

  return pooler.toString();
}

export function resolveRuntimeDatabaseUrl(): {
  url: string;
  source: "pooler-env" | "session-pooler" | "dedicated-pooler" | "direct";
} {
  if (process.env.DATABASE_POOLER_URL) {
    return {
      url: normalizeDatabaseUrl(process.env.DATABASE_POOLER_URL),
      source: "pooler-env",
    };
  }

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (isProductionLike() && isSupabaseDirectConnection(rawUrl)) {
    const region = getSupabaseRegion();

    if (region) {
      const sessionPooler = convertDirectToSharedSessionPooler(rawUrl, region);
      if (sessionPooler) {
        return { url: sessionPooler, source: "session-pooler" };
      }
    }

    const dedicatedPooler = convertDirectToDedicatedPooler(rawUrl);
    if (dedicatedPooler) {
      return { url: dedicatedPooler, source: "dedicated-pooler" };
    }
  }

  return { url: normalizeDatabaseUrl(rawUrl), source: "direct" };
}

export function getRuntimeDatabaseUrl(): string {
  return resolveRuntimeDatabaseUrl().url;
}

export function logDatabaseConnectionMode(): void {
  const { url, source } = resolveRuntimeDatabaseUrl();
  const host = getDatabaseHost(url);

  if (source === "pooler-env") {
    console.log(`Using DATABASE_POOLER_URL host: ${host}`);
    return;
  }

  if (source === "session-pooler") {
    console.log(`Using Supabase session pooler host: ${host}`);
    return;
  }

  if (source === "dedicated-pooler") {
    console.log(
      `Using Supabase dedicated pooler host: ${host} (set SUPABASE_REGION for shared pooler if this fails)`,
    );
    return;
  }

  console.log(`Prisma using database host: ${host}`);

  if (isProductionLike() && isSupabaseDirectConnection(process.env.DATABASE_URL ?? "")) {
    console.warn(
      [
        "Warning: DATABASE_URL points to a Supabase direct connection.",
        "On Render, add SUPABASE_REGION (from Supabase -> Project Settings -> General).",
        "Example: SUPABASE_REGION=ap-south-1",
        "Or set DATABASE_POOLER_URL to the Transaction pooler string from Supabase.",
      ].join(" "),
    );
  }
}

export function getDatabaseConnectionHelp(): string {
  return [
    "Render cannot use Supabase direct connections (db.*.supabase.co:5432) reliably.",
    "Add one of these on Render:",
    "1) SUPABASE_REGION=<your-region>  (recommended; keeps DATABASE_URL as-is)",
    "2) DATABASE_POOLER_URL=<transaction pooler URL from Supabase dashboard>",
  ].join("\n");
}
