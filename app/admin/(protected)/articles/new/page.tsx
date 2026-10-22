import Link from "next/link";
import { ArticleForm } from "@/components/admin/article-form";
import { isArticleCategorySlug } from "@/lib/categories";
import { getSiteCopy } from "@/lib/site-copy";
import { editorPageHref, editorCategoryLabels, editorPublicReturnPath } from "@/lib/editor-map";

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; returnTo?: string }>;
}) {
  const query = await searchParams;
  const value = query.category ?? "";
  const category = isArticleCategorySlug(value) ? value : undefined;
  const copy = await getSiteCopy();
  const categoryLabels = editorCategoryLabels(copy);
  const returnTo = query.returnTo ? editorPublicReturnPath(query.returnTo, category ? `/${category}` : "/hufuzhishi") : undefined;
  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header cms-admin-panel-header-row">
        <div>
          <p className="editor-kicker">新增官网内容</p>
          <h2>新建{category ? categoryLabels[category] : ""}文章</h2>
          <p>
            发布后自动出现在所选栏目；标题、摘要用于栏目卡片，封面图片用于文章详情。
          </p>
        </div>
        <Link
          className="cms-admin-button"
          href={returnTo ?? (category ? editorPageHref(category) : "/admin/articles")}
        >
          {returnTo ? "返回官网原位置" : "返回内容列表"}
        </Link>
      </div>

      <ArticleForm
        mode="create"
        initialCategory={category}
        categoryLabels={categoryLabels}
        returnTo={returnTo}
      />
    </section>
  );
}
