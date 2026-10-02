export type AppEnv = {
  port: number;
  databaseUrl: string;
  authSecret: string;
  corsOrigins: string[];
  cookieSecure: boolean;
  cookieName: string;
  sessionTtl: string;
};

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) {
    return cached;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const authSecret = process.env.AUTH_SECRET?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  if (!authSecret || authSecret.length < 16) {
    throw new Error("AUTH_SECRET is required and must be at least 16 characters");
  }

  const cookieSecure = process.env.COOKIE_SECURE === undefined
    ? process.env.NODE_ENV === "production"
    : process.env.COOKIE_SECURE === "true";
  if (process.env.NODE_ENV === "production" && !cookieSecure) {
    throw new Error("COOKIE_SECURE must be true in production");
  }

  cached = {
    port: Number(process.env.PORT ?? 4000),
    databaseUrl,
    authSecret,
    corsOrigins: (process.env.CORS_ORIGIN ?? "http://127.0.0.1:3000,http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    cookieSecure,
    cookieName: "hbp_session",
    sessionTtl: "7d",
  };
  return cached;
}

export function resetEnvCache() {
  cached = null;
}
