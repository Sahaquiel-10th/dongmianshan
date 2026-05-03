import type { Metadata } from "next";
import { getPublishedSiteSection } from "@/lib/site-sections";

export const metadata: Metadata = {
  title: "关于东面山 - 东方熟龄肌男士护肤",
  description: "了解东面山品牌故事、研发理念和熟龄男士护肤定位。",
  alternates: {
    canonical: "/guanyudongmianshan",
  },
};

export default async function AboutPage() {
  const about = await getPublishedSiteSection("about");

  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">{about.eyebrow}</p>
          <h1>{about.title}</h1>
          <p>{about.subtitle}</p>
        </div>
      </section>
      <section className="site-section about-story" id="story">
        <div className="site-container narrow-copy">
          {about.items.length === 0 ? <p>暂无内容，请在员工后台进入关于东面山补充。</p> : null}
          {about.items.map((item) => (
            <section key={item.id} id={item.id}>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
