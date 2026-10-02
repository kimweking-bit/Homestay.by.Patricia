import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendTmp = path.join(root, "backend/.tmp");
mkdirSync(backendTmp, { recursive: true });

function isOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.setTimeout(800);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });
}

function waitForPort(port, label, timeoutMs = 40_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      if (await isOpen(port)) {
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${label} on 127.0.0.1:${port}`));
        return;
      }
      setTimeout(() => {
        void attempt();
      }, 300);
    };
    void attempt();
  });
}

const children = [];

function run(args, extraEnv = {}) {
  const child = spawn("npm", args, {
    cwd: root,
    env: {
      ...process.env,
      TMPDIR: backendTmp,
      TEMP: backendTmp,
      TMP: backendTmp,
      ...extraEnv,
    },
    stdio: "inherit",
  });
  children.push(child);
  return child;
}

function runOnce(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", args, {
      cwd: root,
      env: {
        ...process.env,
        TMPDIR: backendTmp,
        TEMP: backendTmp,
        TMP: backendTmp,
      },
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${args.join(" ")} exited with ${code ?? "null"}`));
    });
  });
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("uncaughtException", (error) => {
  console.error(error);
  shutdown();
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.error(error);
  shutdown();
  process.exit(1);
});

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});
process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

const envFile = path.join(root, "backend/.env");
if (!existsSync(envFile)) {
  copyFileSync(path.join(root, "backend/.env.example"), envFile);
  console.log("Created backend/.env from backend/.env.example");
}

if (await isOpen(5433)) {
  console.log("PGlite already listening on 127.0.0.1:5433");
} else {
  console.log("Starting PGlite on 127.0.0.1:5433");
  run(["run", "db:up", "--workspace", "backend"]);
  await waitForPort(5433, "PGlite");
}

try {
  await runOnce(["run", "prisma:seed", "--workspace", "backend"]);
} catch {
  console.log("Seed failed; syncing schema onto PGlite with prisma db push.");
  await runOnce(["run", "prisma:push", "--workspace", "backend"]);
  await runOnce(["run", "prisma:seed", "--workspace", "backend"]);
}

if (await isOpen(4000)) {
  console.log("API already listening on 127.0.0.1:4000");
} else {
  console.log("Starting API on 127.0.0.1:4000");
  run(["run", "dev:backend"]);
  await waitForPort(4000, "API");
}

if (await isOpen(3000)) {
  console.log("Frontend already listening on 127.0.0.1:3000");
} else {
  console.log("Starting frontend on http://localhost:3000");
  run(["run", "dev:frontend"]);
  await waitForPort(3000, "frontend");
}

console.log("Homestay.by.Patricia is ready at http://localhost:3000");
await new Promise(() => {});
