import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于东面山 - 东方熟龄肌男士护肤",
  description: "了解东面山品牌故事、研发理念和熟龄男士护肤定位。",
  alternates: {
    canonical: "/guanyudongmianshan",
  },
};

export default function AboutPage() {
  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">关于东面山</p>
          <h1>专注东方熟龄肌男士护肤</h1>
          <p>成熟男性需要的不是复杂步骤，而是一套能长期执行、兼顾体面与效率的护理方案。</p>
        </div>
      </section>
      <section className="site-section about-story" id="story">
        <div className="site-container narrow-copy">
          <h2>品牌故事</h2>
          <p>
            东面山从熟龄男性真实护肤困境出发：工作节奏快、剃须频繁、熬夜通勤多、护肤知识门槛高。品牌希望用更清晰的产品结构和更稳妥的配方逻辑，帮助他们建立低负担的护肤习惯。
          </p>
          <h2 id="research">研发理念</h2>
          <p>
            以温和清洁、补水修护、屏障强韧为基础，再围绕暗沉、细纹、松弛和疲惫感做针对性表达。后续品牌部门可继续补充真实研发资料、备案信息和功效测试内容。
          </p>
        </div>
      </section>
    </main>
  );
}
