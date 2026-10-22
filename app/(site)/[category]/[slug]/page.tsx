import { categoryCopy } from "@/lib/site-copy-config";
import { getSiteCopy } from "@/lib/site-copy";
import Link from "next/link";
import { ArticleActions, EditableCard } from "@/components/site/editor-tools";
import { getEditorPage, editorPageName } from "@/lib/editor-map";
import { notFound, redirect } from "next/navigation";
import { getKnowledgeProducts } from "@/lib/knowledge";
import {
  Breadcrumbs,
  ExampleNote,
  ProductCards,
} from "@/components/site/content";
import { ArticleBody } from "@/components/content/article-body";
import {
  formatArticleDate,
  getAdjacentPublishedArticles,
  getPublishedArticleBySlug,
  getPublishedArticleMetadata,
  getPublishedCategoryBySlug,
  getRelatedArticles,
  parseArticleTags,
} from "@/lib/articles";
import {
  getLegacyArticleCategoryRedirect,
  isArticleCategorySlug,
} from "@/lib/categories";

export const dynamic = "force-dynamic";

type ArticleDetailPageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ArticleDetailPageProps) {
  const { category, slug } = await params;
  const legacyCategory = getLegacyArticleCategoryRedirect(category);

  if (legacyCategory) {
    redirect(`/${legacyCategory}/${slug}`);
  }

  if (!isArticleCategorySlug(category)) {
    return {};
  }

  try {
    return await getPublishedArticleMetadata(category, slug);
  } catch {
    return {};
  }
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { category, slug } = await params;
  const legacyCategory = getLegacyArticleCategoryRedirect(category);

  if (legacyCategory) {
    redirect(`/${legacyCategory}/${slug}`);
  }

  if (!isArticleCategorySlug(category)) {
    notFound();
  }

  const copy = await getSiteCopy();
  const article = await getPublishedArticleBySlug(category, slug);

  if (!article) {
    notFound();
  }

  const categoryItem = getPublishedCategoryBySlug(article.category);
  const parent =
    getEditorPage(getEditorPage(article.category)?.group ?? "care") ??
    getEditorPage("care")!;
  const tags = parseArticleTags(article.tags);
  const [relatedArticles, adjacentArticles, products] = await Promise.all([
    getRelatedArticles(article),
    getAdjacentPublishedArticles(article),
    getKnowledgeProducts(article),
  ]);

  return (
    <main className="cms-content-shell">
      <article className="cms-content-article-shell">
        <div className="cms-content-container">
          <Breadcrumbs
            items={[
              { label: editorPageName(parent, copy), href: parent.path },
              {
                label: categoryCopy(copy, categoryItem.slug),
                href: `/${article.category}`,
              },
              { label: article.title },
            ]}
          />

          <header className="cms-content-article-header">
            <p className="cms-content-eyebrow">
              {categoryCopy(copy, categoryItem.slug)}
            </p>
            <h1>{article.title}</h1>
            {article.summary ? (
              <p className="cms-content-lead">{article.summary}</p>
            ) : null}

            <div className="cms-content-article-meta">
              {article.code ? (
                <span>
                  {copy["article.code"]}
                  {article.code}
                </span>
              ) : null}
              {article.author ? (
                <span>
                  {copy["article.author"]}
                  {article.author}
                </span>
              ) : null}
              {article.publishedAt ? (
                <span>
                  {copy["article.date"]}
                  {formatArticleDate(article.publishedAt)}
                </span>
              ) : null}
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

          {article.isExample ? <ExampleNote /> : null}
          <ArticleBody content={article.content} />
          <ArticleActions article={{ id: article.id, title: article.title, category: article.category, slug: article.slug }} />
          {products.length ? (
            <section className="cms-content-related">
              <h2>{copy["article.products"]}</h2>
              <ProductCards products={products} />
            </section>
          ) : null}

          <nav className="cms-content-adjacent" aria-label="文章上一篇和下一篇">
            {adjacentArticles.previous ? (
              <Link
                href={`/${adjacentArticles.previous.category}/${adjacentArticles.previous.slug}`}
              >
                <span>{copy["article.previous"]}</span>
                <strong>{adjacentArticles.previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {adjacentArticles.next ? (
              <Link
                href={`/${adjacentArticles.next.category}/${adjacentArticles.next.slug}`}
              >
                <span>{copy["article.next"]}</span>
                <strong>{adjacentArticles.next.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>

          {relatedArticles.length > 0 ? (
            <section className="cms-content-related">
              <div className="cms-content-section-head">
                <h2>{copy["article.related"]}</h2>
              </div>
              <div className="cms-content-grid">
                {relatedArticles.map((item) => (
                  <EditableCard key={item.id} href={`/admin/articles/${item.id}/edit`} label={item.title} article={{ id: item.id, title: item.title, category: item.category, slug: item.slug }}>
                    <Link className="cms-content-card" href={`/${item.category}/${item.slug}`}>
                      <div className="cms-content-card-meta">
                        <span>{formatArticleDate(item.publishedAt)}</span>
                      </div>
                      <h3 className="cms-content-card-title">{item.title}</h3>
                      {item.summary ? <p className="cms-content-card-summary">{item.summary}</p> : null}
                    </Link>
                  </EditableCard>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>
    </main>
  );
}
