import { stringList } from "./content-fields";
import { prisma } from "./prisma";
import { MOCK_PUBLISHED_ARTICLES } from "./mock-content";
import { fallbackSiteProducts } from "./products";
import { fallbackSections } from "./site-sections";

// Only insert missing records; preserve all existing editorial and deletion states.
export async function seedExamples() {
  return prisma.$transaction(
    async (tx) => {
      const idMap = new Map<string, string>();
      const created: typeof MOCK_PUBLISHED_ARTICLES = [];
      for (const a of MOCK_PUBLISHED_ARTICLES) {
        const existing = await tx.article.findUnique({
          where: { slug: a.slug },
        });
        if (existing) idMap.set(a.id, existing.id);
        else {
          const row = await tx.article.create({
            data: {
              ...a,
              relatedArticleIds: [],
              relatedProductSlugs: stringList(a.relatedProductSlugs),
            },
          });
          idMap.set(a.id, row.id);
          created.push(a);
        }
      }
      const references = (value: unknown) =>
        stringList(value).map((id) => idMap.get(id) ?? id);
      for (const a of created)
        await tx.article.update({
          where: { id: a.id },
          data: { relatedArticleIds: references(a.relatedArticleIds) },
        });
      for (const [index, p] of fallbackSiteProducts().entries()) {
        await tx.product.upsert({
          where: { slug: p.slug },
          update: {},
          create: {
            slug: p.slug,
            name: p.name,
            subtitle: p.subtitle,
            summary: p.summary,
            routineStep: p.routineStep,
            coverImage: p.image,
            shopUrl: p.shopUrl,
            benefits: p.benefits,
            scenes: p.scenes,
            usage: p.usage,
            features: p.features,
            ingredients: p.ingredients,
            relatedArticleIds: references(p.relatedArticleIds),
            isExample: true,
            status: "published",
            sortOrder: index,
          },
        });
      }
      for (const s of Object.values(fallbackSections)) {
        await tx.siteSection.upsert({
          where: { key: s.key },
          update: {},
          create: { ...s, items: s.items },
        });
      }
      return {
        articles: created.length,
        sections: Object.keys(fallbackSections).length,
      };
    },
    { maxWait: 10000, timeout: 30000 },
  );
}
