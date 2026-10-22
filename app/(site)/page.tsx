import { navigationCopyKeys } from "@/lib/site-copy-config";
import { getSiteCopy } from "@/lib/site-copy";
import Link from "next/link";
import { getPublishedProducts } from "@/lib/products";
import { getPublishedSiteSection } from "@/lib/site-sections";
import { getPublishedArticlesByCategory } from "@/lib/articles";
import {
  KnowledgeCards,
  ProductCards,
  SectionItems,
  SectionLink,
  SectionTags,
} from "@/components/site/content";
import { navItems } from "@/lib/homepage";
import { EditMarker } from "@/components/site/editor-tools";
export default async function Page() {
  const copy = await getSiteCopy();
  const [products, hero, productIntro, ingredientIntro, ingredients] =
    await Promise.all([
      getPublishedProducts(),
      getPublishedSiteSection("homepage-hero"),
      getPublishedSiteSection("homepage-products"),
      getPublishedSiteSection("homepage-ingredients"),
      getPublishedArticlesByCategory("core-ingredients"),
    ]);
  const slides = hero.items.length
    ? hero.items
    : hero.status === "published"
      ? [
          {
            id: "hero",
            title: hero.title,
            subtitle: hero.eyebrow,
            body: hero.subtitle,
            mediaUrl: hero.mediaUrl,
            ctaLabel: hero.ctaLabel,
            ctaUrl: hero.ctaUrl,
          },
        ]
      : [];
  return (
    <main className="brand-site-shell">
      <section
        className="homepage-hero"
        aria-label="品牌海报"
        id="homepage-hero"
      >
        <div className="hero-carousel">
          {slides.length ? (
            slides.map((s, i) => (
              <article className="hero-slide" key={s.id}>
                {s.mediaUrl ? (
                  <img src={s.mediaUrl} alt="品牌海报配图" />
                ) : null}
                <div className="hero-shade" />
                <div className="site-container hero-slide-content">
                  <p className="site-eyebrow">{s.subtitle}</p>
                  {i === 0 ? <h1>{s.title}</h1> : <h2>{s.title}</h2>}
                  <p>{s.body}</p>
                  <SectionTags section={hero} />
                  {"tags" in s && Array.isArray(s.tags) ? (
                    <div className="scene-grid">
                      {s.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  {hero.body ? <p>{hero.body}</p> : null}
                  <div className="hero-actions">
                    {s.ctaUrl ? (
                      <Link
                        className="site-button site-button-primary"
                        href={s.ctaUrl}
                      >
                        {s.ctaLabel || copy["common.more"]}
                      </Link>
                    ) : null}
                  </div>
                  <EditMarker href={s.id === "hero" ? "/admin/sections/homepage-hero" : `/admin/sections/homepage-hero#item-${s.id}`} label={s.title || "首页海报"} />
                </div>
              </article>
            ))
          ) : (
            <div className="site-container empty-hero">
              <h1>{copy["brand.name"]}</h1>
              <p>{copy["empty.home"]}</p>
              <Link href="/chanpin">{copy["common.product"]} →</Link>
              <EditMarker href="/admin/sections/homepage-hero" label="首页海报" />
            </div>
          )}
        </div>
      </section>
      <nav className="site-container home-portals" aria-label="探索东面山">
        {navItems.map((x, i) => (
          <Link href={x.href} key={x.href}>
            <span>0{i + 1}</span>
            <strong>{copy[navigationCopyKeys[x.href]] ?? x.label}</strong>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </nav>
      <div className="site-container">
        <EditMarker href="/admin/site-copy#copy-nav" label="首页四个导航入口" />
      </div>
      {productIntro.status === "published" ? (
        <section className="site-section products-band" id="products">
          <div className="site-container">
            <div className="section-heading">
              {productIntro.mediaUrl ? (
                <img
                  className="section-lead-image"
                  src={productIntro.mediaUrl}
                  alt={productIntro.title}
                />
              ) : null}
              <p className="site-eyebrow">{productIntro.eyebrow}</p>
              <h2>{productIntro.title}</h2>
              <SectionTags section={productIntro} />
              <p>{productIntro.subtitle}</p>
              {productIntro.body ? <p>{productIntro.body}</p> : null}
            </div>
            {products.length ? (
              <ProductCards products={products.slice(0, 3)} />
            ) : (
              <p>{copy["empty.products"]}</p>
            )}
            <SectionItems section={productIntro} />
            <SectionLink section={productIntro} />
          <EditMarker
            href="/admin/sections/homepage-products"
            label={productIntro.title}
          />

          </div>
        </section>
      ) : null}
      {ingredientIntro.status === "published" ? (
        <section className="site-section" id="ingredients">
          <div className="site-container">
            <div className="section-heading">
              {ingredientIntro.mediaUrl ? (
                <img
                  className="section-lead-image"
                  src={ingredientIntro.mediaUrl}
                  alt={ingredientIntro.title}
                />
              ) : null}
              <p className="site-eyebrow">{ingredientIntro.eyebrow}</p>
              <h2>{ingredientIntro.title}</h2>
              <SectionTags section={ingredientIntro} />
              <p>{ingredientIntro.subtitle}</p>
              {ingredientIntro.body ? <p>{ingredientIntro.body}</p> : null}
            </div>
            {ingredients.length ? (
              <KnowledgeCards articles={ingredients.slice(0, 3)} />
            ) : (
              <p>{copy["empty.ingredients"]}</p>
            )}
            <SectionItems section={ingredientIntro} />
            <SectionLink section={ingredientIntro} />
          <EditMarker
            href="/admin/sections/homepage-ingredients"
            label={ingredientIntro.title}
          />

          </div>
        </section>
      ) : null}
    </main>
  );
}
