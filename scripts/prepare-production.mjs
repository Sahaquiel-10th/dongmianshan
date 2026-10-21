import nextEnv from "@next/env";
import prismaPackage from "@prisma/client";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const { loadEnvConfig } = nextEnv;
const { PrismaClient } = prismaPackage;
loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL?.startsWith("mysql:")) {
  console.log("[prepare] Local preview: MySQL preparation skipped.");
  process.exit(0);
}
const db = new PrismaClient();
try {
  // The baseline only creates missing tables. It never replaces an existing table.
  const baseline = (
    await readFile(new URL("./schema-baseline.sql", import.meta.url), "utf8")
  ).replace(/CREATE TABLE /g, "CREATE TABLE IF NOT EXISTS ");
  for (const sql of baseline
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await db.$executeRawUnsafe(sql);
  const columns =
    await db.$queryRaw`SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE()`;
  const present = new Set(
    columns.map((x) => `${x.tableName}.${x.columnName}`.toLowerCase()),
  );
  const additions = [
    ["Article", "code", "VARCHAR(40) NULL"],
    ["Article", "relatedArticleIds", "JSON NULL"],
    ["Article", "deletedAt", "DATETIME(3) NULL"],
    ["Article", "relatedProductSlugs", "JSON NULL"],
    ["Article", "isExample", "BOOLEAN NOT NULL DEFAULT false"],
    ["Product", "deletedAt", "DATETIME(3) NULL"],
    ["Product", "usage", "TEXT NULL"],
    ["Product", "features", "TEXT NULL"],
    ["Product", "ingredients", "TEXT NULL"],
    ["Product", "relatedArticleIds", "JSON NULL"],
    ["Product", "isExample", "BOOLEAN NOT NULL DEFAULT false"],
    ["SiteSection", "tags", "JSON NULL"],
  ];
  const added = new Set();
  for (const [table, column, definition] of additions) {
    if (present.has(`${table}.${column}`.toLowerCase())) continue;
    await db.$executeRawUnsafe(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`,
    );
    added.add(`${table}.${column}`);
    console.log(`[prepare] Added ${table}.${column}`);
  }
  // Fill only fields added during this upgrade; subsequent deploys preserve intentional edits/clears.
  const examples = {
    usage:
      "示例：具体用量、频次和注意事项请以包装说明为准，待品牌补充正式使用方法。",
    features: "示例：产品肤感与使用特性待品牌确认。",
    ingredients:
      "原料成分待品牌依据实际包装成分表补充；原料知识关联不代表本产品已添加该成分。",
  };
  for (const [field, value] of Object.entries(examples))
    if (added.has(`Product.${field}`)) {
      await db.$executeRawUnsafe(
        `UPDATE \`Product\` SET \`${field}\` = ?, \`isExample\` = true WHERE \`${field}\` IS NULL`,
        value,
      );
    }
  // Keep legacy article URLs working with the repository's existing redirect map.
  for (const [previous, next] of [["brand", "brand-introduction"], ["science", "skincare-science"], ["review", "product-description"], ["tutorial", "usage-guide"], ["faq", "problem-solving"], ["case-study", "other"]]) {
    const result = await db.article.updateMany({ where: { category: previous }, data: { category: next } });
    if (result.count) console.log(`[prepare] Mapped ${result.count} legacy articles: ${previous} -> ${next}`);
  }
  // Seed is insert-only and uses actual IDs if an article already exists under the same slug.
  const seed = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/seed-examples.ts"],
    { cwd: process.cwd(), env: process.env, stdio: "inherit" },
  );
  if (seed.status !== 0) throw new Error("SEED_FAILED");
  console.log("[prepare] Production schema and editable content are ready.");
} catch (error) {
  console.error(
    "[prepare] Failed. Check database access and CREATE/ALTER permissions.",
    typeof error?.code === "string" ? error.code : "",
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
