import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Dashboard</p>
          <h2>内容管理后台</h2>
          <p>可管理文章、产品和官网各内容板块。删除内容保留 15 天，可一键恢复。</p>
        </div>
      </div>

      <div className="cms-admin-card-grid">
        <article className="cms-admin-card">
          <h3>文章管理</h3>
          <p>查看已有文章，进入编辑页，或删除无效内容。</p>
          <Link className="cms-admin-button" href="/admin/articles">
            进入文章列表
          </Link>
        </article>

        <article className="cms-admin-card">
          <h3>新建文章</h3>
          <p>创建新的 SEO/GEO 内容草稿，后续再补前台展示页。</p>
          <Link className="cms-admin-button cms-admin-button-primary" href="/admin/articles/new">
            开始写文章
          </Link>
        </article>

        <article className="cms-admin-card">
          <h3>产品一览</h3>
          <p>维护产品图、卖点、场景、购买链接和排序。</p>
          <Link className="cms-admin-button" href="/admin/products">
            进入产品管理
          </Link>
        </article>

        <article className="cms-admin-card">
          <h3>官网板块</h3>
          <p>维护首页轮播、男士护肤场景、用户证言、教育、关于和肌肤测试。</p>
          <Link className="cms-admin-button" href="/admin/sections">
            编辑官网板块
          </Link>
        </article>

        <article className="cms-admin-card">
          <h3>数据库检查</h3>
          <p>检查线上 MySQL 是否已同步后台所需表和字段。</p>
          <Link className="cms-admin-button" href="/admin/setup">
            查看同步状态
          </Link>
        </article>
      </div>
    </section>
  );
}
