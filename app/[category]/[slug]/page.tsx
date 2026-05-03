import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/content/article-body";
import {
  formatArticleDate,
  getPublishedArticleBySlug,
  getPublishedArticleMetadata,
  getPublishedCategoryBySlug,
  parseArticleTags,
} from "@/lib/articles";
import { isArticleCategorySlug } from "@/lib/categories";

export const dynamic = "force-dynamic";

type ArticleDetailPageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ArticleDetailPageProps) {
  const { category, slug } = await params;

  if (!isArticleCategorySlug(category)) {
    return {};
  }

  try {
    return await getPublishedArticleMetadata(category, slug);
  } catch {
    return {};
  }
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { category, slug } = await params;

  if (!isArticleCategorySlug(category)) {
    notFound();
  }

  let article: Awaited<ReturnType<typeof getPublishedArticleBySlug>> = null;

  try {
    article = await getPublishedArticleBySlug(category, slug);
  } catch {
    article = null;
  }

  if (!article) {
    notFound();
  }

  const categoryItem = getPublishedCategoryBySlug(article.category);
  const tags = parseArticleTags(article.tags);

  return (
    <main className="cms-content-shell">
      <article className="cms-content-article-shell">
        <div className="cms-content-container">
          <nav className="cms-content-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">首页</Link>
            <span>/</span>
            <Link href={`/${article.category}`}>{categoryItem.label}</Link>
            <span>/</span>
            <span>{article.title}</span>
          </nav>

          <header className="cms-content-article-header">
            <p className="cms-content-eyebrow">{categoryItem.label}</p>
            <h1>{article.title}</h1>
            {article.summary ? <p className="cms-content-lead">{article.summary}</p> : null}

            <div className="cms-content-article-meta">
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
          </header>

          {article.coverImage ? (
            <div className="cms-content-cover-frame">
              <img src={article.coverImage} alt={article.title} />
            </div>
          ) : null}

          <ArticleBody content={article.content} />
        </div>
      </article>
    </main>
  );
}
