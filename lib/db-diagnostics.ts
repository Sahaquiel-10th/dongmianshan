import { prisma } from "./prisma";

type TableRow = {
  tableName: string;
};

type ColumnRow = {
  tableName: string;
  columnName: string;
};

export type CmsDatabaseCheck = {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type CmsDatabaseDiagnostics = {
  canConnect: boolean;
  databaseName: string | null;
  databaseTarget: string;
  error: string | null;
  checks: CmsDatabaseCheck[];
};

const REQUIRED_CHECKS = [
  {
    key: "article_deleted_at",
    label: "文章软删除字段",
    tableName: "Article",
    columnName: "deletedAt",
    detail: "Article.deletedAt 用于文章删除后 15 天内恢复。",
  },
  {
    key: "product_table",
    label: "产品管理表",
    tableName: "Product",
    detail: "Product 表用于后台管理产品一览。",
  },
  {
    key: "product_deleted_at",
    label: "产品软删除字段",
    tableName: "Product",
    columnName: "deletedAt",
    detail: "Product.deletedAt 用于产品删除后 15 天内恢复。",
  },
  {
    key: "site_section_table",
    label: "官网板块表",
    tableName: "SiteSection",
    detail: "SiteSection 表用于后台管理首页轮播、官网板块和肌肤测试等内容。",
  },
] as const;

function getColumnName(check: (typeof REQUIRED_CHECKS)[number]) {
  return "columnName" in check ? check.columnName : null;
}

function getSafeDatabaseTarget() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    return "DATABASE_URL 未配置";
  }

  try {
    const url = new URL(rawUrl);
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}${url.pathname}`;
  } catch {
    return "DATABASE_URL 格式无法解析";
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "未知数据库错误";
}

export async function runCmsDatabaseDiagnostics(): Promise<CmsDatabaseDiagnostics> {
  const databaseTarget = getSafeDatabaseTarget();

  try {
    const databaseRows = await prisma.$queryRaw<{ databaseName: string | null }[]>`
      SELECT DATABASE() AS databaseName
    `;
    const tableRows = await prisma.$queryRaw<TableRow[]>`
      SELECT TABLE_NAME AS tableName
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('Article', 'Product', 'SiteSection')
    `;
    const columnRows = await prisma.$queryRaw<ColumnRow[]>`
      SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('Article', 'Product', 'SiteSection')
        AND COLUMN_NAME IN ('deletedAt')
    `;

    const tables = new Set(tableRows.map((row) => row.tableName));
    const columns = new Set(columnRows.map((row) => `${row.tableName}.${row.columnName}`));

    return {
      canConnect: true,
      databaseName: databaseRows[0]?.databaseName ?? null,
      databaseTarget,
      error: null,
      checks: REQUIRED_CHECKS.map((check) => {
        const columnName = getColumnName(check);
        const hasTable = tables.has(check.tableName);
        const ok = columnName ? hasTable && columns.has(`${check.tableName}.${columnName}`) : hasTable;

        return {
          key: check.key,
          label: check.label,
          ok,
          detail: ok ? check.detail : `缺少 ${columnName ? `${check.tableName}.${columnName}` : check.tableName}`,
        };
      }),
    };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("[cms-db-diagnostics] database check failed", message);

    return {
      canConnect: false,
      databaseName: null,
      databaseTarget,
      error: message,
      checks: REQUIRED_CHECKS.map((check) => ({
        key: check.key,
        label: check.label,
        ok: false,
        detail: "数据库连接失败，暂时无法检查表结构。",
      })),
    };
  }
}
