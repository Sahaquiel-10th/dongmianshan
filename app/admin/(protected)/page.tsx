import { ExampleImport } from "@/components/admin/example-import";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Dashboard</p>
          <h2>内容管理后台</h2>
          <p>
            可管理文章、产品和官网各内容板块。删除内容保留 15 天，可一键恢复。
          </p>
        </div>
      </div>

      <ExampleImport />
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
          <p>
            编辑人群、需求、核心原料、使用指南等知识词条，选择关联知识与产品，发布后同步官网。
          </p>
          <Link
            className="cms-admin-button cms-admin-button-primary"
            href="/admin/articles/new"
          >
            开始写文章
          </Link>
        </article>

        <article className="cms-admin-card">
          <h3>产品一览</h3>
          <p>维护基础介绍、使用方法、特性、原料成分、功能功效及直购链接。</p>
          <Link className="cms-admin-button" href="/admin/products">
            进入产品管理
          </Link>
        </article>

        <article className="cms-admin-card">
          <h3>官网板块</h3>
          <p>
            逐项管理首页海报、产品领域、核心原料、品牌、护理入口、购买渠道及联系和问答。
          </p>
          <Link className="cms-admin-button" href="/admin/sections">
            编辑官网板块
          </Link>
        </article>
      </div>
    </section>
  );
}
