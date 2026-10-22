import { getSiteCopy } from "@/lib/site-copy";
import Link from "next/link";
import { EditMarker } from "@/components/site/editor-tools";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getPublishedProductBySlug,
  getMergedProductRedirect,
} from "@/lib/products";
import { getProductKnowledge } from "@/lib/knowledge";
import {
  Breadcrumbs,
  ExampleNote,
  KnowledgeCards,
} from "@/components/site/content";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getPublishedProductBySlug((await params).slug);
  const copy = await getSiteCopy();
  return product
    ? {
        title: product.seoTitle || `${product.name} - ${copy["brand.name"]}`,
        description: product.seoDescription || product.summary,
        alternates: { canonical: `/chanpin/${product.slug}` },
      }
    : {};
}
export default async function ProductPage({ params }: Props) {
  const copy = await getSiteCopy();
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) {
    const target = await getMergedProductRedirect(slug);
    if (target) permanentRedirect(`/chanpin/${target}`);
    notFound();
  }
  const knowledge = await getProductKnowledge(product);
  const ingredients = knowledge.filter(
    (x) => x.category === "core-ingredients",
  );
  const guides = knowledge.filter((x) => x.category !== "core-ingredients");
  const details = [
    ["intro", copy["product.intro"], product.summary],
    ["usage", copy["product.usage"], product.usage],
    ["features", copy["product.features"], product.features],
    ["ingredients", copy["product.ingredients"], product.ingredients],
    ["benefits", copy["product.benefits"], product.benefits.join("\n")],
  ];
  return (
    <main className="brand-subpage">
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: copy["nav.products"], href: "/chanpin" },
            { label: product.name },
          ]}
        />
      </div>
      <section className="product-detail-hero">
        <div className="site-container product-detail-grid">
          <div>
            <p className="site-eyebrow">{product.routineStep}</p>
            <h1>{product.name}</h1>
            <p>{product.subtitle}</p>
            <div className="scene-grid">
              {product.benefits.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            {product.isExample ? <ExampleNote /> : null}
            <div className="hero-actions">
              {product.shopUrl ? (
                <a
                  className="site-button site-button-primary"
                  href={product.shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy["product.buy"]} ↗
                </a>
              ) : (
                <Link
                  className="site-button site-button-primary"
                  href="/goumai"
                >
                  {copy["product.channels"]}
                </Link>
              )}
              <a className="site-button site-button-ghost" href="#usage">
                {copy["product.usageLink"]}
              </a>
            </div>
      <EditMarker
        href={
          product.id ? `/admin/products/${product.id}/edit` : "/admin/products"
        }
        label={product.name}
      />
          </div>
          {product.image ? (
            <img
              src={product.image}
              alt={`${product.name}${product.isExample ? "示例配图" : "产品图"}`}
            />
          ) : null}
        </div>
      </section>
      <nav className="site-container detail-tabs" aria-label="产品详情目录">
        {details.map(([id, title]) => (
          <a href={`#${id}`} key={id}>
            {title}
          </a>
        ))}
      </nav>
      <section className="site-section">
        <div className="site-container product-facts">
          {details.map(([id, title, text], i) => (
            <section id={id} key={id}>
              <span className="fact-number">0{i + 1}</span>
              <div>
                <h2>{title}</h2>
                <p className="preserve-lines">{text || copy["empty.detail"]}</p>
                <EditMarker href={product.id ? `/admin/products/${product.id}/edit#product-${id}` : "/admin/products"} label={title} />
                {id === "ingredients" && ingredients.length ? (
                  <KnowledgeCards articles={ingredients} />
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </section>
      {product.scenes.length ? (
        <section className="site-section products-band">
          <div className="site-container">
            <h2>{copy["product.scenes"]}</h2>
            <div className="scene-grid">
              {product.scenes.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {guides.length ? (
        <section className="site-section">
          <div className="site-container">
            <p className="site-eyebrow">{copy["common.continue"]}</p>
            <h2>{copy["product.guides"]}</h2>
            <KnowledgeCards articles={guides} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
