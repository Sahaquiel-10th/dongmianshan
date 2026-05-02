import { ArticleForm } from "@/components/admin/article-form";

export default function NewArticlePage() {
  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Create</p>
          <h2>新建文章</h2>
          <p>当前使用 Markdown textarea 录入正文内容。</p>
        </div>
      </div>

      <ArticleForm mode="create" />
    </section>
  );
}
