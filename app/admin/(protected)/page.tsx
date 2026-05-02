import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Dashboard</p>
          <h2>内容管理后台</h2>
          <p>当前阶段仅包含登录、文章管理和基础内容录入。</p>
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
      </div>
    </section>
  );
}
