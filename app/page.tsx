import Link from "next/link";
import {
  navItems,
  placeholderImages,
  products,
  scienceArticles,
  testimonials,
  topLinks,
} from "@/lib/homepage";

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="site-container utility-inner">
          <Link className="admin-link" href="/admin/login">
            员工登录
          </Link>
          <nav aria-label="辅助导航">
            {topLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="site-container main-nav">
        <Link className="brand-mark" href="/">
          <span>东面山</span>
          <small>东方熟龄肌男士护肤</small>
        </Link>
        <nav className="primary-nav" aria-label="主导航">
          {navItems.map((item) => (
            <div className="nav-item" key={item.href}>
              <Link href={item.href}>{item.label}</Link>
              {item.children ? (
                <div className="nav-dropdown">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default function Page() {
  return (
    <main className="brand-site-shell">
      <SiteHeader />

      <section className="homepage-hero" aria-label="产品场景轮播">
        <div className="hero-carousel">
          {products.map((product) => (
            <article className="hero-slide" key={product.slug}>
              <img src={product.image} alt={`${product.shortName}场景占位图`} />
              <div className="hero-shade" />
              <div className="site-container hero-slide-content">
                <p className="site-eyebrow">{product.routineStep}</p>
                <h1>{product.name}</h1>
                <p>{product.summary}</p>
                <div className="hero-actions">
                  <a className="site-button site-button-primary" href={product.shopUrl} target="_blank" rel="noreferrer">
                    立即购买
                  </a>
                  <Link className="site-button site-button-ghost" href={`/chanpin/${product.slug}`}>
                    查看详情
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section routine-feature">
        <div className="site-container split-feature">
          <div className="feature-media">
            <img src={placeholderImages.routine} alt="男士护肤场景占位图" />
          </div>
          <div className="feature-copy">
            <p className="site-eyebrow">男士护肤场景</p>
            <h2>把护肤放进成熟男性真实的一天</h2>
            <p>
              东面山三步方案面向晨间通勤、剃须后、运动后、夜间修护等高频场景，重点解决熟龄男性常见的紧绷、暗沉、粗糙和疲惫感。
            </p>
            <div className="scene-grid">
              {["商务通勤", "剃须敏感", "运动出汗", "熬夜疲惫"].map((scene) => (
                <span key={scene}>{scene}</span>
              ))}
            </div>
            <Link className="site-text-link" href="/jifuceping">
              进入肌肤测试
            </Link>
          </div>
        </div>
      </section>

      <section className="site-section products-band" id="chanpin">
        <div className="site-container">
          <div className="section-heading">
            <p className="site-eyebrow">产品一览</p>
            <h2>洁面、补水、修护，三件事讲清楚</h2>
          </div>
          <div className="product-overview-grid">
            {products.map((product) => (
              <article className="product-overview-card" key={product.slug}>
                <img src={product.image} alt={`${product.shortName}占位图`} />
                <div>
                  <p>{product.routineStep}</p>
                  <h3>{product.shortName}</h3>
                  <span>{product.subtitle}</span>
                  <Link href={`/chanpin/${product.slug}`}>了解产品</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section science-feature">
        <div className="site-container split-feature split-feature-reverse">
          <div className="feature-copy">
            <p className="site-eyebrow">皮肤科普</p>
            <h2>用研究内容回答熟龄男士护肤问题</h2>
            <p>
              这里承接参考站的教育内容逻辑，用科普文章解释屏障、剃须刺激、补水、紧致和成分协同，方便用户理解，也方便搜索引擎抓取。
            </p>
            <div className="article-teaser-list">
              {scienceArticles.map((article) => (
                <Link key={article.title} href={article.href}>
                  <strong>{article.title}</strong>
                  <span>{article.summary}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="feature-media">
            <img src={placeholderImages.science} alt="皮肤科普研究占位图" />
          </div>
        </div>
      </section>

      <section className="site-section testimonial-band">
        <div className="site-container">
          <div className="section-heading">
            <p className="site-eyebrow">用户证言</p>
            <h2>东面山在真实使用场景里被看见</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article className="testimonial-card" key={item.name}>
                <div className="testimonial-avatar" aria-hidden="true" />
                <p>{item.quote}</p>
                <strong>{item.name}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-container footer-grid">
          <div>
            <strong>东面山</strong>
            <p>东方熟龄肌男士护肤开创者。你是他们的东面山，我愿做你的东面山。</p>
          </div>
          <nav>
            <Link href="/chanpin">产品一览</Link>
            <Link href="/hufuzhishi">教育</Link>
            <Link href="/guanyudongmianshan">关于东面山</Link>
            <Link href="/jifuceping">肌肤测试</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
