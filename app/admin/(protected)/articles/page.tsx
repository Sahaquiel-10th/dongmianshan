import { prisma } from "@/lib/prisma";
import { ArticleList } from "@/components/admin/article-list";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
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

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Articles</p>
          <h2>文章管理</h2>
          <p>管理所有草稿和已发布文章。</p>
        </div>
      </div>

      <ArticleList articles={articles} />
    </section>
  );
}
