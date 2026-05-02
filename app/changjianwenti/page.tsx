import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "常见问题解答 - 东面山",
  description: "东面山产品、购买、使用流程与售后常见问题解答。",
  alternates: {
    canonical: "/changjianwenti",
  },
};

export default function FaqLandingPage() {
  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">常见问题解答</p>
          <h1>购买、使用与护肤流程问题</h1>
          <p>这里作为 FAQ 聚合入口，后续可在后台维护问答卡片，也可继续发布更长的 FAQ 文章。</p>
        </div>
      </section>
      <section className="site-section">
        <div className="site-container education-grid">
          {["三步护肤是否需要早晚都用", "剃须后能否立即使用精华水", "三款产品适合哪些肌肤状态"].map((question) => (
            <article className="education-card" key={question}>
              <span>FAQ</span>
              <strong>{question}</strong>
              <p>占位回答内容，后续由品牌部门补充详细说明。</p>
            </article>
          ))}
          <Link className="education-card" href="/faq">
            <span>文章栏目</span>
            <strong>查看更多 FAQ 文章</strong>
            <p>进入现有内容中心的 FAQ 栏目。</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
