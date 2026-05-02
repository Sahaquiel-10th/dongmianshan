import Link from "next/link";
import type { Metadata } from "next";
import { products, scienceArticles } from "@/lib/homepage";

export const metadata: Metadata = {
  title: "搜索 - 东面山",
  description: "东面山站内搜索占位页面。",
  alternates: {
    canonical: "/sousuo",
  },
};

export default function SearchPage() {
  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">搜索</p>
          <h1>查找产品与护肤知识</h1>
          <p>当前为搜索入口占位，后续可接入数据库全文检索或第三方站内搜索。</p>
        </div>
      </section>
      <section className="site-section">
        <div className="site-container education-grid">
          {products.map((product) => (
            <Link className="education-card" href={`/chanpin/${product.slug}`} key={product.slug}>
              <span>产品</span>
              <strong>{product.shortName}</strong>
              <p>{product.subtitle}</p>
            </Link>
          ))}
          {scienceArticles.map((article) => (
            <Link className="education-card" href={article.href} key={article.title}>
              <span>文章</span>
              <strong>{article.title}</strong>
              <p>{article.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
