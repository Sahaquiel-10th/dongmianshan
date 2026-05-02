export const ARTICLE_CATEGORIES = [
  { slug: "science", label: "科普" },
  { slug: "review", label: "评测" },
  { slug: "tutorial", label: "教程" },
  { slug: "faq", label: "FAQ" },
  { slug: "case-study", label: "案例" },
] as const;

export type ArticleCategorySlug = (typeof ARTICLE_CATEGORIES)[number]["slug"];

export const ARTICLE_CATEGORY_SLUGS = [
  "science",
  "review",
  "tutorial",
  "faq",
  "case-study",
] as const;

export const ARTICLE_CATEGORY_LABELS = new Map(
  ARTICLE_CATEGORIES.map((category) => [category.slug, category.label]),
);

export function getArticleCategoryLabel(slug: string) {
  return ARTICLE_CATEGORY_LABELS.get(slug as (typeof ARTICLE_CATEGORY_SLUGS)[number]) ?? slug;
}

export function isArticleCategorySlug(value: string): value is ArticleCategorySlug {
  return ARTICLE_CATEGORY_SLUGS.includes(value as ArticleCategorySlug);
}
