export const ARTICLE_CATEGORIES = [
  { slug: "other", label: "其他" },
  { slug: "audience-awareness", label: "人群认知" },
  { slug: "usage-guide", label: "使用指南" },
  { slug: "product-description", label: "产品说明" },
  { slug: "relationship-gifting", label: "关系送礼" },
  { slug: "selection-guide", label: "选购指南" },
  { slug: "problem-solving", label: "问题解决" },
  { slug: "skincare-science", label: "护肤科普" },
  { slug: "brand-introduction", label: "品牌介绍" },
] as const;

export type ArticleCategorySlug = (typeof ARTICLE_CATEGORIES)[number]["slug"];

export const ARTICLE_CATEGORY_SLUGS = [
  "other",
  "audience-awareness",
  "usage-guide",
  "product-description",
  "relationship-gifting",
  "selection-guide",
  "problem-solving",
  "skincare-science",
  "brand-introduction",
] as const;

export const LEGACY_ARTICLE_CATEGORY_REDIRECTS = {
  brand: "brand-introduction",
  science: "skincare-science",
  review: "product-description",
  tutorial: "usage-guide",
  faq: "problem-solving",
  "case-study": "other",
} as const;

export type LegacyArticleCategorySlug = keyof typeof LEGACY_ARTICLE_CATEGORY_REDIRECTS;

export const ARTICLE_CATEGORY_LABELS = new Map(
  ARTICLE_CATEGORIES.map((category) => [category.slug, category.label]),
);

export function getArticleCategoryLabel(slug: string) {
  return ARTICLE_CATEGORY_LABELS.get(slug as (typeof ARTICLE_CATEGORY_SLUGS)[number]) ?? slug;
}

export function isArticleCategorySlug(value: string): value is ArticleCategorySlug {
  return ARTICLE_CATEGORY_SLUGS.includes(value as ArticleCategorySlug);
}

export function getLegacyArticleCategoryRedirect(value: string) {
  return LEGACY_ARTICLE_CATEGORY_REDIRECTS[value as LegacyArticleCategorySlug] ?? null;
}
