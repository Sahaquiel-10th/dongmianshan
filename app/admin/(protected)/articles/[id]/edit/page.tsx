import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleForm } from "@/components/admin/article-form";
import { formatDateTimeLocal, serializeRelatedArticleIds } from "@/lib/articles";
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
      <div className="cms-admin-panel-header cms-admin-panel-header-row">
        <div>
          <p className="cms-admin-eyebrow">Edit</p>
          <h2>编辑文章</h2>
          <p>修改文章内容和基础 SEO 字段。</p>
        </div>
        <Link className="cms-admin-button" href="/admin/articles">
          返回上一级页面
        </Link>
      </div>

      <ArticleForm
        mode="edit"
        articleId={article.id}
        initialValues={{
          code: article.code ?? "",
          title: article.title,
          slug: article.slug,
          summary: article.summary ?? "",
          category: article.category,
          tags: article.tags ?? "",
          coverImage: article.coverImage ?? "",
          content: article.content,
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
          relatedArticleIds: serializeRelatedArticleIds(article.relatedArticleIds),
          status: article.status,
          author: article.author ?? "",
          publishedAt: formatDateTimeLocal(article.publishedAt),
        }}
      />
    </section>
  );
}
