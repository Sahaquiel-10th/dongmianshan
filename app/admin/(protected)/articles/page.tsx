import { prisma } from "@/lib/prisma";
import { ArticleList } from "@/components/admin/article-list";

export default async function AdminArticlesPage() {
  let setupError: string | null = null;
  let articles: {
    id: string;
    title: string;
    category: string;
    status: string;
    deletedAt: Date | null;
    updatedAt: Date;
  }[] = [];

  try {
    articles = await prisma.article.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
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
        deletedAt: null,
      }));
      setupError = "数据库还没有同步 deletedAt 字段，文章可查看，但删除恢复功能需要先执行 npm run prisma:push。";
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

      {setupError ? <p className="cms-admin-alert cms-admin-alert-error">{setupError}</p> : null}
      <ArticleList articles={articles} />
    </section>
  );
}
