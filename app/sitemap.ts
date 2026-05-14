import type { MetadataRoute } from "next";
import { ARTICLE_CATEGORIES } from "@/lib/categories";
import { getAllPublishedArticles } from "@/lib/articles";
import { getPublishedProducts } from "@/lib/products";
import { getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Awaited<ReturnType<typeof getAllPublishedArticles>> = [];
  let products: Awaited<ReturnType<typeof getPublishedProducts>> = [];

  try {
    articles = await getAllPublishedArticles();
  } catch {
    articles = [];
  }

  try {
    products = await getPublishedProducts();
  } catch {
    products = [];
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...[
      "/chanpin",
      "/hufuzhishi",
      "/guanyudongmianshan",
      "/jifuceping",
      "/lianxiwomen",
      "/changjianwenti",
      "/sousuo",
    ].map((pathname) => ({
        url: getAbsoluteUrl(pathname),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),
    ...ARTICLE_CATEGORIES.map((category) => ({
      url: getAbsoluteUrl(`/${category.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: getAbsoluteUrl(`/chanpin/${product.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: getAbsoluteUrl(`/${article.category}/${article.slug}`),
    lastModified: article.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...articleEntries];
}
