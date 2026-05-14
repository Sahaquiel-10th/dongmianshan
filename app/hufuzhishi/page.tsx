import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLE_CATEGORIES } from "@/lib/categories";
import { getPublishedSiteSection } from "@/lib/site-sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "教育 - 东面山内容中心",
  description: "东面山护肤知识入口，聚合品牌、科普、评测、教程、FAQ 和案例内容。",
  alternates: {
    canonical: "/hufuzhishi",
  },
};

export default async function EducationPage() {
  const education = await getPublishedSiteSection("education");

  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">{education.eyebrow}</p>
          <h1>{education.title}</h1>
          <p>{education.subtitle}</p>
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
