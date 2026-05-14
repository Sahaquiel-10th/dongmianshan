import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticlePreviewActions } from "@/components/admin/article-preview-actions";
import { ArticleBody } from "@/components/content/article-body";
import { formatArticleDate, parseArticleTags } from "@/lib/articles";
import { getArticleCategoryLabel } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

type PreviewArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PreviewArticlePage({ params }: PreviewArticlePageProps) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: {
      id,
    },
  });

  if (!article || article.deletedAt) {
    notFound();
  }

  const tags = parseArticleTags(article.tags);
  const publicHref = `/${article.category}/${article.slug}`;

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Preview</p>
          <h2>文章预览</h2>
          <p>{article.status === "published" ? "这篇文章已发布，前台可访问。" : "确认内容无误后发布，或返回编辑继续修改。"}</p>
        </div>
        <Link className="cms-admin-button" href={`/admin/articles/${article.id}/edit`}>
          返回上一级页面
        </Link>
      </div>

      <ArticlePreviewActions
        articleId={article.id}
        editHref={`/admin/articles/${article.id}/edit`}
        publicHref={publicHref}
        isPublished={article.status === "published"}
      />

      <article className="cms-admin-preview-panel">
        <header className="cms-content-article-header cms-admin-preview-header">
          <p className="cms-content-eyebrow">{getArticleCategoryLabel(article.category)}</p>
          <h1>{article.title}</h1>
          {article.summary ? <p className="cms-content-lead">{article.summary}</p> : null}
          <div className="cms-content-article-meta">
            {article.code ? <span>编号：{article.code}</span> : null}
            <span>状态：{article.status === "published" ? "已发布" : "草稿"}</span>
            {article.author ? <span>作者：{article.author}</span> : null}
            {article.publishedAt ? <span>发布时间：{formatArticleDate(article.publishedAt)}</span> : null}
          </div>
          {tags.length > 0 ? (
            <div className="cms-content-tags">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
          {article.coverImage ? (
            <div className="cms-content-cover-frame">
              <img src={article.coverImage} alt={article.title} />
            </div>
          ) : null}
        </header>

        <ArticleBody content={article.content} />
      </article>
    </section>
  );
}
