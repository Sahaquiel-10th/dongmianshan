import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLE_CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "教育 - 东面山内容中心",
  description: "东面山护肤知识入口，聚合科普、评测、教程、FAQ 和案例内容。",
  alternates: {
    canonical: "/hufuzhishi",
  },
};

export default function EducationPage() {
  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">教育</p>
          <h1>护肤知识入口</h1>
          <p>这里承接参考站的 skincare education 逻辑，用拼音路径作为中国国内 SEO 的内容入口。</p>
        </div>
      </section>
      <section className="site-section">
        <div className="site-container education-grid">
          {ARTICLE_CATEGORIES.map((category) => (
            <Link className="education-card" key={category.slug} href={`/${category.slug}`}>
              <span>内容栏目</span>
              <strong>{category.label}</strong>
              <p>查看该栏目下所有已发布文章。</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
