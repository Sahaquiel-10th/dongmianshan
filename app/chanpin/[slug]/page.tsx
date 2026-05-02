import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, products } from "@/lib/homepage";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} - 东面山`,
    description: product.summary,
    alternates: {
      canonical: `/chanpin/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="brand-subpage">
      <section className="product-detail-hero">
        <div className="site-container product-detail-grid">
          <div>
            <p className="site-eyebrow">{product.routineStep}</p>
            <h1>{product.name}</h1>
            <p>{product.summary}</p>
            <div className="hero-actions">
              <a className="site-button site-button-primary" href={product.shopUrl} target="_blank" rel="noreferrer">
                立即购买
              </a>
              <Link className="site-button site-button-outline" href="/chanpin">
                返回产品一览
              </Link>
            </div>
          </div>
          <img src={product.image} alt={`${product.shortName}产品占位图`} />
        </div>
      </section>
      <section className="site-section">
        <div className="site-container detail-columns">
          <article>
            <h2>核心功效</h2>
            {product.benefits.map((benefit) => (
              <p key={benefit}>{benefit}</p>
            ))}
          </article>
          <article>
            <h2>推荐场景</h2>
            {product.scenes.map((scene) => (
              <p key={scene}>{scene}</p>
            ))}
          </article>
          <article>
            <h2>内容运营提示</h2>
            <p>本页后续可以由产品 CMS 维护：产品图、功效、场景、购买链接、SEO 标题和描述均已预留字段。</p>
          </article>
        </div>
      </section>
    </main>
  );
}
