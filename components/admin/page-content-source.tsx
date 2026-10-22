import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { sectionSources } from "@/lib/editor-map";

export async function PageContentSource({
  sectionKey,
  pageId,
}: {
  sectionKey: string;
  pageId: string;
}) {
  const source = sectionSources(sectionKey);
  if (!source) return null;
  const isHome = pageId === "home";
  const all =
    source.kind === "products"
      ? (
          await prisma.product.findMany({
            where: { deletedAt: null },
            orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
            select: {
              id: true,
              name: true,
              slug: true,
              coverImage: true,
              subtitle: true,
              status: true,
            },
          })
        ).map((p) => ({
          id: p.id,
          title: p.name,
          image: p.coverImage,
          summary: p.subtitle,
          status: p.status,
          path: `/chanpin/${p.slug}`,
          edit: `/admin/products/${p.id}/edit?from=${pageId}`,
        }))
      : (
          await prisma.article.findMany({
            where: { category: source.category, deletedAt: null },
            orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              summary: true,
              coverImage: true,
              status: true,
            },
          })
        ).map((a) => ({
          id: a.id,
          title: a.title,
          image: null,
          summary: a.summary,
          status: a.status,
          path: `/${a.category}/${a.slug}`,
          edit: `/admin/articles/${a.id}/edit?from=${pageId}`,
        }));
  const published = all.filter((x) => x.status === "published");
  const visible = isHome ? published.slice(0, 3) : published.slice(0, 12);
  const hidden = all.filter((x) => !visible.includes(x));
  const listHref =
    source.kind === "products"
      ? "/admin/products"
      : `/admin/articles?category=${source.category}`;
  const createHref =
    source.kind === "products"
      ? "/admin/products/new"
      : `/admin/articles/new?category=${source.category}`;
  const row = (item: (typeof all)[number], shown: boolean) => (
    <div className="editor-content-row" key={item.id}>
      {item.image ? (
        <img src={item.image} alt="" />
      ) : (
        <span className="editor-no-image" aria-hidden="true">
          {source.kind === "products" ? "产品" : "文章"}
        </span>
      )}
      <div>
        <strong>{item.title}</strong>
        <p>{item.summary || "尚未填写简介"}</p>
        <small>
          {shown
            ? "官网正在展示"
            : item.status === "draft"
              ? "草稿 · 官网不展示"
              : isHome
                ? "已发布 · 首页仅展示前三项"
                : "已发布 · 栏目中展示"}
        </small>
      </div>
      <Link className="cms-admin-button" href={item.edit}>
        编辑{source.kind === "products" ? "产品" : "文章"}
      </Link>
    </div>
  );
  return (
    <div className="editor-source" id={`source-${sectionKey}`}>
      <div className="editor-source-head">
        <div>
          <h4>{source.label}</h4>
          <p>
            {source.kind === "products"
              ? "卡片图片、名称与购买链接取自同一份产品资料；修改后会同步到产品详情、首页及购买页。"
              : "卡片标题和摘要取自对应文章；封面图片用于打开后的文章详情。点击编辑即可修改。"}
            {isHome ? "首页按官网顺序展示前三项。" : ""}
          </p>
        </div>
        <Link href={createHref} className="cms-admin-button">
          新增{source.kind === "products" ? "产品" : "文章"}
        </Link>
      </div>
      {visible.length ? (
        visible.map((x) => row(x, true))
      ) : (
        <p className="editor-empty">
          这里暂时没有已发布内容，可新增或从下方草稿中发布。
        </p>
      )}
      {hidden.length ? (
        <details className="editor-hidden-content">
          <summary>其他内容与草稿（{hidden.length}）</summary>
          {hidden.slice(0, 12).map((x) => row(x, false))}
          {hidden.length > 12 ? (
            <Link href={listHref}>查看全部 {all.length} 项 →</Link>
          ) : null}
        </details>
      ) : null}
      <Link className="editor-source-all" href={listHref}>
        管理全部{source.kind === "products" ? "产品与排序" : "栏目文章"} →
      </Link>
    </div>
  );
}
