import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArticleCard } from "@/components/content/article-card";
import {
  getCategoryMetadata,
  getPublishedArticlesByCategory,
  getPublishedCategoryBySlug,
} from "@/lib/articles";
import { getLegacyArticleCategoryRedirect, isArticleCategorySlug } from "@/lib/categories";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const legacyCategory = getLegacyArticleCategoryRedirect(category);

  if (legacyCategory) {
    redirect(`/${legacyCategory}`);
  }

  if (!isArticleCategorySlug(category)) {
    return {};
  }

  return getCategoryMetadata(category);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const legacyCategory = getLegacyArticleCategoryRedirect(category);

  if (legacyCategory) {
    redirect(`/${legacyCategory}`);
  }

  if (!isArticleCategorySlug(category)) {
    notFound();
  }

  const categoryItem = getPublishedCategoryBySlug(category);
  let articles: Awaited<ReturnType<typeof getPublishedArticlesByCategory>> = [];

  try {
    articles = await getPublishedArticlesByCategory(category);
  } catch {
    articles = [];
  }

  return (
    <main className="cms-content-shell">
      <section className="cms-content-hero">
        <div className="cms-content-container">
          <p className="cms-content-eyebrow">内容栏目</p>
          <h1>{categoryItem.label}</h1>
          <p className="cms-content-lead">聚合展示当前栏目下所有已发布文章，面向搜索引擎和内容检索场景。</p>
        </div>
      </section>

      <section className="cms-content-section">
        <div className="cms-content-container">
          <div className="cms-content-section-head">
            <h2>最新文章</h2>
            <Link className="cms-content-link" href="/">
              返回首页
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="cms-content-empty">
              <p>该栏目下暂时还没有已发布文章。</p>
            </div>
          ) : (
            <div className="cms-content-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
