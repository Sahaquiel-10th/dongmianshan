import type { Article } from "@prisma/client";
import { getAllPublishedArticles } from "./articles";
import { stringList } from "./content-fields";
import { getPublishedProducts, type SiteProduct } from "./products";

export function articleHref(article: Pick<Article, "category" | "slug">) {
  return `/${article.category}/${article.slug}`;
}
export async function getProductKnowledge(product: SiteProduct) {
  const articles = await getAllPublishedArticles();
  return articles.filter(
    (article) =>
      product.relatedArticleIds.includes(article.id) ||
      stringList(article.relatedProductSlugs).includes(product.slug),
  );
}
export async function getKnowledgeProducts(
  article: Pick<Article, "id" | "relatedProductSlugs">,
) {
  const products = await getPublishedProducts();
  return products.filter(
    (product) =>
      product.relatedArticleIds.includes(article.id) ||
      stringList(article.relatedProductSlugs).includes(product.slug),
  );
}

// Match phrases and tokens, including the meeting's natural-language example.
export function searchScore(query: string, text: string) {
  const normalized = query.toLowerCase().replace(/三十五/g, "35");
  const terms = normalized.match(/[a-z0-9]+|[\u4e00-\u9fff]{1,}/g) ?? [];
  const expanded = terms.flatMap((term) =>
    /^[\u4e00-\u9fff]+$/.test(term) && term.length > 2
      ? [
          term,
          ...Array.from({ length: term.length - 1 }, (_, i) =>
            term.slice(i, i + 2),
          ),
        ]
      : [term],
  );
  const haystack = text.toLowerCase().replace(/三十五/g, "35");
  return [...new Set(expanded)].reduce(
    (score, term) => score + (haystack.includes(term) ? term.length : 0),
    0,
  );
}
