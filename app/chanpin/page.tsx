import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "产品一览 - 东面山",
  description: "查看东面山洁面慕斯、精华水、精华乳三步护肤产品。",
  alternates: {
    canonical: "/chanpin",
  },
};

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">产品一览</p>
          <h1>三款产品，搭建熟龄男士基础护肤程序</h1>
          <p>按清洁、补水、修护三个步骤组织内容，后续可在后台维护每款产品的卖点、图片、购买链接和 SEO 信息。</p>
        </div>
      </section>
      <section className="site-section">
        <div className="site-container product-list">
          {products.length === 0 ? (
            <div className="cms-content-empty">
              <p>暂无产品内容，请在员工后台进入产品一览补充。</p>
            </div>
          ) : null}
          {products.map((product) => (
            <article className="product-row" key={product.slug}>
              <img src={product.image} alt={`${product.shortName}占位图`} />
              <div>
                <p className="site-eyebrow">{product.routineStep}</p>
                <h2>{product.name}</h2>
                <p>{product.summary}</p>
                <div className="scene-grid">
                  {product.benefits.map((benefit) => (
                    <span key={benefit}>{benefit}</span>
                  ))}
                </div>
                <div className="hero-actions">
                  <Link className="site-button site-button-primary" href={`/chanpin/${product.slug}`}>
                    查看详情
                  </Link>
                  <a className="site-button site-button-outline" href={product.shopUrl} target="_blank" rel="noreferrer">
                    立即购买
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
