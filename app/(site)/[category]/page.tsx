import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getPublishedSiteSection,
  type SiteSectionKey,
} from "@/lib/site-sections";
import {
  Breadcrumbs,
  SectionIntro,
  SectionItems,
  SectionLink,
} from "@/components/site/content";
import { ArticleCard } from "@/components/content/article-card";
import { CreateArticleCard } from "@/components/site/editor-tools";
import { getPublishedArticlesByCategory } from "@/lib/articles";
import {
  getLegacyArticleCategoryRedirect,
  isArticleCategorySlug,
} from "@/lib/categories";
import { getSiteCopy } from "@/lib/site-copy";
import { categoryCopy } from "@/lib/site-copy-config";
import { getEditorPage, editorPageName } from "@/lib/editor-map";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ category: string }> };
const sectionKey = (category: string) =>
  (category === "core-ingredients"
    ? "ingredients"
    : `category-${category}`) as SiteSectionKey;
export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const legacy = getLegacyArticleCategoryRedirect(category);
  if (legacy) redirect(`/${legacy}`);
  if (!isArticleCategorySlug(category)) return {};
  const [intro, copy] = await Promise.all([
    getPublishedSiteSection(sectionKey(category)),
    getSiteCopy(),
  ]);
  return {
    title: `${intro.title} - ${copy["brand.name"]}`,
    description: intro.subtitle || undefined,
    alternates: { canonical: `/${category}` },
  };
}
export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const legacy = getLegacyArticleCategoryRedirect(category);
  if (legacy) redirect(`/${legacy}`);
  if (!isArticleCategorySlug(category)) notFound();
  const [articles, intro, copy] = await Promise.all([
    getPublishedArticlesByCategory(category),
    getPublishedSiteSection(sectionKey(category)),
    getSiteCopy(),
  ]);
  const parent =
    getEditorPage(getEditorPage(category)?.group ?? "care") ??
    getEditorPage("care")!;
  return (
    <main className="brand-subpage">
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: editorPageName(parent, copy), href: parent.path },
            { label: categoryCopy(copy, category) },
          ]}
        />
      </div>
      <section className="subpage-hero">
        <div className="site-container">
          <SectionIntro section={intro} />
          <SectionLink section={intro} />
        </div>
      </section>
      <section className="site-section">
        <div className="site-container">
          <div className="cms-content-section-head">
            <h2>
              {category === "core-ingredients"
                ? copy["category.ingredients"]
                : copy["category.browse"]}
            </h2>
            <Link className="cms-content-link" href="/hufuzhishi">
              {copy["nav.care"]}
            </Link>
          </div>
          <div className="education-grid">
            <SectionItems section={intro} />
          </div>
          {!articles.length ? <p>{copy["empty.category"]}</p> : null}
            <div className="cms-content-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              <CreateArticleCard category={category} label={categoryCopy(copy, category)} />
            </div>
        </div>
      </section>
    </main>
  );
}
