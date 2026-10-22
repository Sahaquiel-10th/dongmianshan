import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stringList } from "@/lib/content-fields";
export async function IncomingLinks({
  articleId,
  productSlug,
  ownArticleIds = [],
  ownProductSlugs = [],
}: {
  articleId?: string;
  productSlug?: string;
  ownArticleIds?: string[];
  ownProductSlugs?: string[];
}) {
  const [articles, products] = await Promise.all([
    prisma.article.findMany({
      where: { status: "published", deletedAt: null },
      select: {
        id: true,
        title: true,
        relatedArticleIds: true,
        relatedProductSlugs: true,
      },
    }),
    articleId
      ? prisma.product.findMany({
          where: { status: "published", deletedAt: null },
          select: { id: true, slug: true, name: true, relatedArticleIds: true },
        })
      : Promise.resolve([]),
  ]);
  const links = [
    ...articles
      .filter(
        (a) =>
          !ownArticleIds.includes(a.id) &&
          (articleId
            ? a.id !== articleId &&
              stringList(a.relatedArticleIds).includes(articleId)
            : !!productSlug &&
              stringList(a.relatedProductSlugs).includes(productSlug)),
      )
      .map((a) => ({ title: a.title, href: `/admin/articles/${a.id}/edit` })),
    ...products
      .filter(
        (p) =>
          !ownProductSlugs.includes(p.slug) &&
          !!articleId &&
          stringList(p.relatedArticleIds).includes(articleId),
      )
      .map((p) => ({ title: p.name, href: `/admin/products/${p.id}/edit` })),
  ];
  if (!links.length) return null;
  return (
    <aside className="cms-admin-alert cms-admin-alert-info">
      <details>
        <summary>其他内容引用了本页（{links.length} 项）</summary>
        <p>官网还会展示以下来源指向本页的关联。取消时，请进入对应来源编辑。</p>
        {links.map((x) => (
          <p key={x.href}>
            <Link className="cms-content-link" href={x.href}>
              {x.title} →
            </Link>
          </p>
        ))}
      </details>
    </aside>
  );
}
