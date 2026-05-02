import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "联系我们 - 东面山",
  description: "东面山联系方式占位页面。",
  alternates: {
    canonical: "/lianxiwomen",
  },
};

export default function ContactPage() {
  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">联系我们</p>
          <h1>品牌咨询与合作</h1>
          <p>此处预留客服、渠道合作、媒体采访和售后咨询信息，后续可由后台维护联系方式与表单说明。</p>
        </div>
      </section>
    </main>
  );
}
