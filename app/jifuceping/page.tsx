import type { Metadata } from "next";
import { getPublishedSiteSection } from "@/lib/site-sections";

export const metadata: Metadata = {
  title: "肌肤测试 - 东面山",
  description: "东面山熟龄男士肌肤测试占位页面，后续可接入问卷和产品推荐逻辑。",
  alternates: {
    canonical: "/jifuceping",
  },
};

export default async function SkinQuizPage() {
  const quiz = await getPublishedSiteSection("skin-test");

  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">{quiz.eyebrow}</p>
          <h1>{quiz.title}</h1>
          <p>{quiz.subtitle}</p>
        </div>
      </section>
      <section className="site-section">
        <div className="site-container quiz-placeholder">
          {quiz.items.length === 0 ? <p>暂无测试题，请在员工后台进入肌肤测试补充。</p> : null}
          {quiz.items.map((question, index) => (
            <label key={question.id}>
              <span>{index + 1}. {question.title}</span>
              <select defaultValue="">
                <option value="" disabled>请选择</option>
                <option>经常</option>
                <option>偶尔</option>
                <option>很少</option>
              </select>
            </label>
          ))}
          <button className="site-button site-button-primary" type="button">
            生成建议
          </button>
        </div>
      </section>
    </main>
  );
}
