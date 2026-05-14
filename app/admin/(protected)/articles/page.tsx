import { prisma } from "@/lib/prisma";
import { ArticleList } from "@/components/admin/article-list";
import Link from "next/link";

export default async function AdminArticlesPage() {
  let setupError: string | null = null;
  let articles: {
    id: string;
    code: string | null;
    title: string;
    category: string;
    status: string;
    deletedAt: Date | null;
    updatedAt: Date;
  }[] = [];

  try {
    articles = await prisma.article.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        code: true,
        title: true,
        category: true,
        status: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
  } catch {
    try {
      const legacyArticles = await prisma.article.findMany({
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          updatedAt: true,
        },
      });

      articles = legacyArticles.map((article) => ({
        ...article,
        code: null,
        deletedAt: null,
      }));
      setupError = "数据库还没有同步文章编号或 deletedAt 字段，文章可查看，但完整功能需要先执行 npm run prisma:push。";
    } catch {
      setupError = "文章表暂时无法读取，请检查数据库连接和 Prisma 表结构。";
    }
  }

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Articles</p>
          <h2>文章管理</h2>
          <p>管理所有草稿和已发布文章。</p>
        </div>
      </div>

      {setupError ? (
        <p className="cms-admin-alert cms-admin-alert-error">
          {setupError} <Link href="/admin/setup">查看数据库检查</Link>
        </p>
      ) : null}
      <ArticleList articles={articles} />
    </section>
  );
}
