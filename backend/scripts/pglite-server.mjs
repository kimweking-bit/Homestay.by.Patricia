import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.env.PGLITE_PORT ?? 5433);
const host = process.env.PGLITE_HOST ?? "127.0.0.1";
const dir = process.env.PGLITE_DIR ?? new URL("../.data/pglite", import.meta.url).pathname;

mkdirSync(dir, { recursive: true });

process.on("unhandledRejection", (error) => {
  console.error("PGlite crashed:", error);
  process.exit(1);
});

const db = await PGlite.create(dir);
const server = new PGLiteSocketServer({
  db,
  port,
  host,
  // The API and the test runner each keep a Prisma connection.
  maxConnections: 10,
});

try {
  await server.start();
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (code === "EADDRINUSE") {
    console.error(`PGlite port ${host}:${port} is already in use. A database process is probably already running.`);
    process.exit(1);
  }
  throw error;
}
console.log(`pglite listening on ${host}:${port} (${dir})`);

async function shutdown() {
  await server.stop();
  await db.close();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
