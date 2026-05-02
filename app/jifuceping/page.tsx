import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "肌肤测试 - 东面山",
  description: "东面山熟龄男士肌肤测试占位页面，后续可接入问卷和产品推荐逻辑。",
  alternates: {
    canonical: "/jifuceping",
  },
};

export default function SkinQuizPage() {
  return (
    <main className="brand-subpage">
      <section className="subpage-hero">
        <div className="site-container">
          <p className="site-eyebrow">肌肤测试</p>
          <h1>找到适合你的三步护肤程序</h1>
          <p>当前先搭建入口和页面结构，后续可以做成问卷：肤质、剃须频率、出油情况、干纹暗沉、使用场景，最终推荐产品组合和文章内容。</p>
        </div>
      </section>
      <section className="site-section">
        <div className="site-container quiz-placeholder">
          {["清洁后是否紧绷", "剃须后是否泛红", "白天是否容易出油", "是否关注细纹轮廓"].map((question, index) => (
            <label key={question}>
              <span>{index + 1}. {question}</span>
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
