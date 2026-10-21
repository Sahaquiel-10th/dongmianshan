import { readFile, writeFile, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
const root = fileURLToPath(new URL("../", import.meta.url));
const localEnvUrl = new URL("../.env.local", import.meta.url);
try {
  const existing = await readFile(localEnvUrl, "utf8");
  const match = existing.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
  if (match && match[1] !== `file:${root}prisma/dev.db`)
    throw new Error(
      "现有 .env.local 指向其他数据库。为避免混用，未切换客户端；请使用独立的本地预览目录。",
    );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
let source = await readFile(
  new URL("../prisma/schema.prisma", import.meta.url),
  "utf8",
);
source = source
  .replace('provider = "mysql"', 'provider = "sqlite"')
  .replace(/\s+@db\.\w+(\([^)]*\))?/g, "")
  .replace(/binaryTargets = \[[^\]]+\]/, 'binaryTargets = ["native"]');
await writeFile(
  new URL("../prisma/local.schema.prisma", import.meta.url),
  source,
);
const env = { ...process.env, DATABASE_URL: `file:${root}prisma/dev.db` };
function run(args) {
  const r = spawnSync(process.execPath, args, {
    cwd: root,
    env,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status || 1);
}
run([
  "node_modules/prisma/build/index.js",
  "generate",
  "--schema",
  "prisma/local.schema.prisma",
]);
await writeFile(new URL("../prisma/dev.db", import.meta.url), "", {
  flag: "a",
});
run([
  "node_modules/prisma/build/index.js",
  "db",
  "push",
  "--schema",
  "prisma/local.schema.prisma",
]);
run(["--import", "tsx", "scripts/seed-examples.ts"]);
try {
  await access(new URL("../.env.local", import.meta.url));
  console.log(
    "Existing .env.local preserved. Set DATABASE_URL to the local SQLite file for preview.",
  );
} catch {
  await writeFile(
    new URL("../.env.local", import.meta.url),
    `DATABASE_URL="${env.DATABASE_URL}"\nCMS_ADMIN_USERNAME="admin"\nCMS_ADMIN_PASSWORD="${randomBytes(18).toString("base64url")}"\nCMS_SESSION_SECRET="${randomBytes(32).toString("hex")}"\nNEXT_PUBLIC_SITE_URL="http://localhost:3100"\n`,
  );
}
console.log(
  "Local preview ready. Run npm run dev -- --port 3100. Preview credentials are in .env.local.",
);
