import { getAllPublishedArticles } from "@/lib/articles";
import { getPublishedProducts } from "@/lib/products";
import { searchScore } from "@/lib/knowledge";
import {
  Breadcrumbs,
  KnowledgeCards,
  ProductCards,
  SectionIntro,
  SectionItems,
  SectionLink,
} from "@/components/site/content";
import { getPublishedSiteSection } from "@/lib/site-sections";
import { getSiteCopy } from "@/lib/site-copy";
import { formatCopy } from "@/lib/site-copy-config";
export async function generateMetadata() {
  const [section, copy] = await Promise.all([
    getPublishedSiteSection("search"),
    getSiteCopy(),
  ]);
  return {
    title: `${section.title} - ${copy["brand.name"]}`,
    description: section.subtitle || undefined,
    alternates: { canonical: "/sousuo" },
  };
}
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 120);
  const [allArticles, allProducts, intro, copy] = await Promise.all([
    getAllPublishedArticles(),
    getPublishedProducts(),
    getPublishedSiteSection("search"),
    getSiteCopy(),
  ]);
  const articles = allArticles
    .map((item) => ({
      item,
      score: searchScore(
        q,
        `${item.title} ${item.summary} ${item.tags} ${item.content}`,
      ),
    }))
    .filter((x) => !q || x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
  const products = allProducts.filter(
    (p) =>
      !q ||
      searchScore(
        q,
        `${p.name} ${p.summary} ${p.ingredients} ${p.benefits.join(" ")} ${p.scenes.join(" ")}`,
      ) > 0,
  );
  return (
    <main className="brand-subpage">
      <div className="site-container">
        <Breadcrumbs items={[{ label: copy["nav.search"] }]} />
      </div>
      <section className="subpage-hero">
        <div className="site-container">
          <SectionIntro section={intro} />
          <SectionLink section={intro} />
          <form className="site-search" action="/sousuo" role="search">
            <label htmlFor="site-query">{copy["search.label"]}</label>
            <div>
              <input
                id="site-query"
                name="q"
                defaultValue={q}
                maxLength={120}
                placeholder={copy["search.placeholder"]}
              />
              <button className="site-button site-button-primary" type="submit">
                {copy["search.submit"]}
              </button>
            </div>
          </form>
        </div>
      </section>
      <section className="site-section">
        <div className="site-container">
          <div className="education-grid">
            <SectionItems section={intro} />
          </div>
          <p role="status">
            {q
              ? formatCopy(copy["search.results"], {
                  query: q,
                  count: articles.length + products.length,
                })
              : copy["search.explore"]}
          </p>
          {articles.length ? (
            <>
              <h2>{copy["search.knowledge"]}</h2>
              <KnowledgeCards articles={articles} />
            </>
          ) : null}
          {products.length ? (
            <>
              <h2>{copy["search.products"]}</h2>
              <ProductCards products={products} />
            </>
          ) : null}
          {!articles.length && !products.length ? (
            <p>{copy["search.empty"]}</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
