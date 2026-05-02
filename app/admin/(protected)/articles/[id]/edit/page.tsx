import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { formatDateTimeLocal } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: {
      id,
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Edit</p>
          <h2>编辑文章</h2>
          <p>修改文章内容和基础 SEO 字段。</p>
        </div>
      </div>

      <ArticleForm
        mode="edit"
        articleId={article.id}
        initialValues={{
          title: article.title,
          slug: article.slug,
          summary: article.summary ?? "",
          category: article.category,
          tags: article.tags ?? "",
          coverImage: article.coverImage ?? "",
          content: article.content,
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
          status: article.status,
          author: article.author ?? "",
          publishedAt: formatDateTimeLocal(article.publishedAt),
        }}
      />
    </section>
  );
}
