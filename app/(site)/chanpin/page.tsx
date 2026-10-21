import { getSectionMetadata } from "@/lib/site-sections";
import { getSiteCopy } from "@/lib/site-copy";
import type { Metadata } from "next";
import { getPublishedProducts } from "@/lib/products";
import { getPublishedSiteSection } from "@/lib/site-sections";
import {
  SectionIntro,
  SectionItems,
  SectionLink,
  ProductCards,
  Breadcrumbs,
} from "@/components/site/content";
export async function generateMetadata() {
  return getSectionMetadata("products-intro", "/chanpin");
}
export default async function ProductsPage() {
  const copy = await getSiteCopy();
  const [products, intro] = await Promise.all([
    getPublishedProducts(),
    getPublishedSiteSection("products-intro"),
  ]);
  return (
    <main className="brand-subpage">
      <div className="site-container">
        <Breadcrumbs items={[{ label: copy["nav.products"] }]} />
      </div>
      <section className="subpage-hero">
        <div className="site-container">
          <SectionIntro section={intro} />
          <SectionLink section={intro} />
        </div>
      </section>
      <section className="site-section">
        <div className="site-container">
          {products.length ? (
            <ProductCards products={products} />
          ) : (
            <p>{copy["empty.products"]}</p>
          )}
          <SectionItems section={intro} />
        </div>
      </section>
    </main>
  );
}
