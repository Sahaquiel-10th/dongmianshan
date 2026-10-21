import type { Prisma } from "@prisma/client";
import { stringList } from "./content-fields";
import { fallbackSiteProducts } from "./products";
import { MOCK_PUBLISHED_ARTICLES } from "./mock-content";

// The original production catalogue uses these full product URLs.
export const ORIGINAL_PRODUCT_SLUGS: Record<string, string> = {
  "jie-mian-mu-si": "dongmianshan-moisturizing-empowerment-foam-cleansing-mousse",
  "jing-hua-shui": "dongmianshan-firming-anti-wrinkle-empowerment-toner",
  "jing-hua-ru": "dongmianshan-firming-anti-wrinkle-empowerment-lotion",
};
export const productMergeKey = (slug: string) => `example-product-merge:${slug}`;

export async function reconcileProductExamples(tx: Prisma.TransactionClient) {
  const aliases = new Map<string, string>();
  let merged = 0;
  const articlesBySlug = new Map((await tx.article.findMany({
    where: { slug: { in: MOCK_PUBLISHED_ARTICLES.map(a => a.slug) } },
    select: { id: true, slug: true },
  })).map(a => [a.slug, a.id]));
  const seedReferenceIds = new Map(MOCK_PUBLISHED_ARTICLES.map(a => [a.id, articlesBySlug.get(a.slug) ?? a.id]));
  for (const [index, sample] of fallbackSiteProducts().entries()) {
    const canonicalSlug = ORIGINAL_PRODUCT_SLUGS[sample.slug];
    const canonical = await tx.product.findUnique({ where: { slug: canonicalSlug } });
    if (!canonical) continue;
    // Also respect an existing draft/deleted original: seeding must not republish it.
    aliases.set(sample.slug, canonical.slug);
    const marker = await tx.siteSection.findUnique({ where: { key: productMergeKey(sample.slug) } });
    if (marker) continue;
    const duplicate = await tx.product.findUnique({ where: { slug: sample.slug } });
    if (!duplicate || duplicate.deletedAt || duplicate.status !== "published" || !duplicate.isExample)
      continue;
    // Only fold an untouched generated sample. Any editorial change preserves it.
    const untouched = duplicate.name === sample.name && duplicate.sortOrder === index &&
      duplicate.subtitle === sample.subtitle && duplicate.summary === sample.summary &&
      duplicate.routineStep === sample.routineStep && duplicate.coverImage === sample.image &&
      duplicate.shopUrl === sample.shopUrl && duplicate.usage === sample.usage &&
      duplicate.features === sample.features && duplicate.ingredients === sample.ingredients &&
      JSON.stringify(stringList(duplicate.benefits)) === JSON.stringify(sample.benefits) &&
      JSON.stringify(stringList(duplicate.scenes)) === JSON.stringify(sample.scenes) &&
      JSON.stringify(stringList(duplicate.relatedArticleIds)) === JSON.stringify(sample.relatedArticleIds.map(id => seedReferenceIds.get(id) ?? id)) &&
      !duplicate.seoTitle && !duplicate.seoDescription;
    if (!untouched) continue;

    const previousReferences = stringList(canonical.relatedArticleIds);
    await tx.product.update({ where: { id: canonical.id }, data: {
      relatedArticleIds: [...new Set([...previousReferences, ...stringList(duplicate.relatedArticleIds)])],
    } });
    const articles = await tx.article.findMany({ select: { id: true, relatedProductSlugs: true } });
    for (const article of articles) {
      const slugs = stringList(article.relatedProductSlugs);
      if (slugs.includes(sample.slug))
        await tx.article.update({ where: { id: article.id }, data: {
          relatedProductSlugs: [...new Set(slugs.map(slug => slug === sample.slug ? canonical.slug : slug))],
        } });
    }
    await tx.product.update({ where: { id: duplicate.id }, data: { status: "draft" } });
    // A private, one-time marker makes subsequent seeds preserve later manual edits.
    await tx.siteSection.create({ data: {
      key: productMergeKey(sample.slug), title: "示例产品重复入口归并记录", status: "draft",
      items: { sourceId: duplicate.id, canonicalId: canonical.id, canonicalSlug, previousReferences },
    } });
    merged++;
  }
  return { aliases, merged };
}
