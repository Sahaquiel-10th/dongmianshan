import { getSectionMetadata } from "@/lib/site-sections";
import { getSiteCopy } from "@/lib/site-copy";
import Link from "next/link";
import { getPublishedProducts } from "@/lib/products";
import { getPublishedSiteSection } from "@/lib/site-sections";
import {
  Breadcrumbs,
  ExampleNote,
  SectionIntro,
  SectionItems,
  SectionLink,
} from "@/components/site/content";
export async function generateMetadata() {
  return getSectionMetadata("purchase", "/goumai");
}
export default async function PurchasePage() {
  const copy = await getSiteCopy();
  const [section, products] = await Promise.all([
    getPublishedSiteSection("purchase"),
    getPublishedProducts(),
  ]);
  return (
    <main className="brand-subpage">
      <div className="site-container">
        <Breadcrumbs items={[{ label: copy["nav.purchase"] }]} />
      </div>
      <section className="subpage-hero">
        <div className="site-container">
          <SectionIntro section={section} />
          <SectionLink section={section} />
        </div>
      </section>
      <section className="site-section">
        <div className="site-container">
          <div className="education-grid">
            <SectionItems section={section} />
          </div>
          <div className="product-list">
            {products.map((p) => (
              <article className="purchase-row" key={p.slug}>
                <div>
                  <p className="site-eyebrow">{p.routineStep}</p>
                  <h2>{p.name}</h2>
                  <p>{p.summary}</p>
                  {p.isExample ? <ExampleNote /> : null}
                </div>
                <div className="hero-actions">
                  <Link
                    className="site-button site-button-outline"
                    href={`/chanpin/${p.slug}`}
                  >
                    {copy["common.product"]}
                  </Link>
                  {p.shopUrl ? (
                    <a
                      className="site-button site-button-primary"
                      href={p.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {copy["product.buy"]} ↗
                    </a>
                  ) : (
                    <span>{copy["product.channelPending"]}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
