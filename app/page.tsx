import Link from "next/link";
import {
  navItems,
  topLinks,
} from "@/lib/homepage";
import { getPublishedProducts } from "@/lib/products";
import { getPublishedSiteSection } from "@/lib/site-sections";

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

export default async function Page() {
  const [products, hero, scenes, science, testimonials] = await Promise.all([
    getPublishedProducts(),
    getPublishedSiteSection("homepage-hero"),
    getPublishedSiteSection("mens-scenes"),
    getPublishedSiteSection("skin-science"),
    getPublishedSiteSection("testimonials"),
  ]);
  const heroSlides =
    hero.items.length > 0
      ? hero.items.map((item) => ({
          key: item.id,
          eyebrow: item.subtitle ?? hero.eyebrow ?? "",
          title: item.title,
          summary: item.body ?? hero.subtitle ?? "",
          image: item.mediaUrl ?? hero.mediaUrl ?? "",
          primaryLabel: item.ctaLabel ?? hero.ctaLabel ?? "查看详情",
          primaryUrl: item.ctaUrl ?? hero.ctaUrl ?? "/chanpin",
          secondaryUrl: "/chanpin",
        }))
      : products.map((product) => ({
          key: product.slug,
          eyebrow: product.routineStep,
          title: product.name,
          summary: product.summary,
          image: product.image,
          primaryLabel: "立即购买",
          primaryUrl: product.shopUrl,
          secondaryUrl: `/chanpin/${product.slug}`,
        }));

  return (
    <main className="brand-site-shell">
      <SiteHeader />

      <section className="homepage-hero" aria-label="产品场景轮播">
        <div className="hero-carousel">
          {heroSlides.length === 0 ? (
            <article className="hero-slide">
              <div className="site-container hero-slide-content">
                <p className="site-eyebrow">暂无内容</p>
                <h1>首页轮播待维护</h1>
                <p>请在员工后台进入首页轮播或产品一览，补充图片、文字和跳转链接。</p>
              </div>
            </article>
          ) : null}
          {heroSlides.map((slide) => (
            <article className="hero-slide" key={slide.key}>
              {slide.image ? <img src={slide.image} alt={`${slide.title}场景图`} /> : null}
              <div className="hero-shade" />
              <div className="site-container hero-slide-content">
                <p className="site-eyebrow">{slide.eyebrow}</p>
                <h1>{slide.title}</h1>
                <p>{slide.summary}</p>
                <div className="hero-actions">
                  <a className="site-button site-button-primary" href={slide.primaryUrl} target="_blank" rel="noreferrer">
                    {slide.primaryLabel}
                  </a>
                  <Link className="site-button site-button-ghost" href={slide.secondaryUrl}>
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
            {scenes.mediaUrl ? <img src={scenes.mediaUrl} alt="男士护肤场景占位图" /> : null}
          </div>
          <div className="feature-copy">
            <p className="site-eyebrow">{scenes.eyebrow}</p>
            <h2>{scenes.title}</h2>
            <p>{scenes.subtitle}</p>
            <div className="scene-grid">
              {scenes.items.map((scene) => (
                <span key={scene.id}>{scene.title}</span>
              ))}
            </div>
            {scenes.ctaUrl ? (
              <Link className="site-text-link" href={scenes.ctaUrl}>
                {scenes.ctaLabel ?? "查看更多"}
              </Link>
            ) : null}
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
            <h2>{science.title}</h2>
            <p>{science.subtitle}</p>
            <div className="article-teaser-list">
              {science.items.map((article) => (
                <Link key={article.id} href={article.ctaUrl ?? "/hufuzhishi"}>
                  <strong>{article.title}</strong>
                  <span>{article.body}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="feature-media">
            {science.mediaUrl ? <img src={science.mediaUrl} alt="皮肤科普研究占位图" /> : null}
          </div>
        </div>
      </section>

      <section className="site-section testimonial-band">
        <div className="site-container">
          <div className="section-heading">
            <p className="site-eyebrow">{testimonials.eyebrow}</p>
            <h2>{testimonials.title}</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.items.map((item) => (
              <article className="testimonial-card" key={item.id}>
                <div className="testimonial-avatar" aria-hidden="true" />
                <p>{item.body}</p>
                <strong>{item.title}</strong>
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
