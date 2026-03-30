const values = [
  {
    icon: "🛡",
    title: "肌肤守护",
    desc: "专研熟龄肌肤问题，提供科学、精准、高效的护肤方案，抵御岁月痕迹。",
  },
  {
    icon: "⛰",
    title: "精神守护",
    desc: "在繁忙与压力中，重拾自信与体面，焕发内在的坚韧力量。",
  },
  {
    icon: "👑",
    title: "身份守护",
    desc: "成熟男性的品质选择，彰显从容不迫、向阳而生的人生态度。",
  },
];

const ingredients = [
  ["玻色因", "深层抗老 紧致轮廓", "🧪"],
  ["可溶性胶原", "充盈弹润 抚平细纹", "💧"],
  ["烟酰胺", "提亮肤色 改善暗沉", "✦"],
  ["α-熊果苷", "均匀透亮 焕发光采", "🌿"],
  ["十肽-4", "强效修护 焕活肌底", "📄"],
  ["铁皮石斛", "东方植萃 深层滋养", "🍃"],
];

const products = [
  {
    title: "洁面慕斯",
    desc: "深层清洁，温和不紧绷，洗去疲惫，开启清爽护肤第一步。",
    target: "净透毛孔 舒缓剃须",
  },
  {
    title: "精华水",
    desc: "极速补水，密集修护，打开肌肤吸收通道，唤醒肌肤活力。",
    target: "水油平衡 细致平滑",
  },
  {
    title: "精华乳",
    desc: "核心抗老，紧致锁水，全天候守护，重塑硬朗轮廓线。",
    target: "抗老紧致 强韧屏障",
  },
];

const problems = [
  ["暗沉无光", "烟酰胺+熊果苷\n双效焕亮，扫除疲态", "🌙"],
  ["岁月细纹", "高浓度玻色因\n充盈胶原，淡化纹理", "💦"],
  ["轮廓松弛", "十肽-4协同胶原\n提拉紧致，重塑线条", "◇"],
  ["屏障脆弱", "专利精粹配方\n强韧肌底，抵御外界", "🛟"],
  ["剃须敏感", "温和舒缓成分\n快速镇静，减少刺激", "✂"],
];

const trustItems = [
  "8项专利配方",
  "全球精选原料",
  "合规检测备案",
  "严谨功效验证",
  "顶尖研发团队",
];

const productImage =
  "https://media-1383535556.cos.ap-shanghai.myqcloud.com/%E4%B8%9C%E9%9D%A2%E5%B1%B1.png";

export default function Page() {
  return (
    <main className="page-shell">
      <section className="hero section-block">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="eyebrow">东方熟龄肌男士护肤开创者</p>
          <h1 className="hero-title">东面山，向阳而生</h1>
          <p className="hero-quote">你是他们的东面山，我愿做你的东面山</p>
          <div className="hero-tags">
            <span>8项专利成分</span>
            <span>多效抗初老</span>
            <span>精简三步护肤</span>
          </div>
          <div className="hero-buttons">
            <a className="btn btn-primary" href="#story">
              了解品牌
            </a>
            <a className="btn btn-secondary" href="#products">
              查看产品
            </a>
          </div>
        </div>
      </section>

      <section className="section-block section-soft">
        <div className="container">
          <h2 className="section-title">三重守护</h2>
          <div className="values-grid">
            {values.map((value) => (
              <article className="card value-card" key={value.title}>
                <div className="emoji-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block" id="story">
        <div className="container story-layout">
          <div className="story-image-frame">
            <img
              src="https://media-1383535556.cos.ap-shanghai.myqcloud.com/%E6%99%A8%E9%97%B4%E6%B4%97%E6%BC%B1%E9%95%9C%E4%B8%AD%E7%85%A7.png"
              alt="成熟男性形象"
            />
          </div>
          <div className="story-copy">
            <blockquote>
              40岁生日那天，镜中的自己让我停下脚步。
              <br />
              发现熟龄男士护肤市场的空白，
              <br />
              东面山，因此诞生。
            </blockquote>
            <p>
              东方男性的皮肤结构与衰老轨迹有着独特的规律。我们深知，成熟不仅是阅历的沉淀，更应是状态的从容。东面山专注于东方熟龄肌的深层需求，不仅解决表面的岁月痕迹，更致力于构建肌肤内在的强韧屏障。
            </p>
            <p>
              为什么是东面山？因为我们懂你背负的责任，懂你对品质的苛求。专为东方熟龄肌男士研发，融合尖端科技与自然精粹，只为那份不可替代的沉稳与自信。
            </p>
          </div>
        </div>
      </section>

      <section className="section-block section-soft">
        <div className="container">
          <h2 className="section-title">8项专利成分矩阵</h2>
          <div className="ingredients-grid">
            {ingredients.map(([name, effect, icon]) => (
              <article className="card ingredient-card" key={name}>
                <div className="ingredient-icon">{icon}</div>
                <div>
                  <h3>{name}</h3>
                  <p>{effect}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block" id="products">
        <div className="container">
          <h2 className="section-title">精简三步护肤方案</h2>
          <div className="products-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product.title}>
                <div className="step-badge">{index + 1}</div>
                <div className="product-image-frame">
                  <img src={productImage} alt={product.title} />
                </div>
                <h3>{product.title}</h3>
                <p>{product.desc}</p>
                <span>{product.target}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block section-soft">
        <div className="container">
          <h2 className="section-title">针对熟龄肌5大问题</h2>
          <div className="problems-grid">
            {problems.map(([title, solution, icon]) => (
              <article className="card problem-card" key={title}>
                <div className="emoji-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{solution}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <h2 className="section-title">专业背书</h2>
          <div className="trust-grid">
            {trustItems.map((item) => (
              <article className="trust-card" key={item}>
                <div className="trust-mark">●</div>
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="closing section-block">
        <div className="closing-overlay" />
        <div className="container closing-content">
          <p>
            你守护家庭、团队、生活
            <span>我们守护你的肌肤、体面与自信</span>
          </p>
        </div>
      </section>
    </main>
  );
}
