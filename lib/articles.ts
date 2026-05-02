import type { Metadata } from "next";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { notFound } from "next/navigation";
import { z } from "zod";
import { MOCK_PUBLISHED_ARTICLES } from "./mock-content";
import { prisma } from "./prisma";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategorySlug,
  getArticleCategoryLabel,
  isArticleCategorySlug,
} from "./categories";
import { ARTICLE_CATEGORY_SLUGS } from "./categories";
import { getAbsoluteUrl } from "./site";

export const ARTICLE_STATUS_VALUES = ["draft", "published"] as const;

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable().optional());

const optionalNullableDate = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.includes("T") && value.length === 16 ? `${value}:00` : value;
    const parsed = new Date(normalized);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return value;
}, z.date().nullable().optional());

export const articleInputSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(200, "标题不能超过 200 个字符"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug 不能为空")
    .max(200, "Slug 不能超过 200 个字符")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 只能包含小写字母、数字和短横线"),
  summary: optionalTrimmedString,
  content: z.string().trim().min(1, "正文不能为空"),
  coverImage: optionalTrimmedString,
  category: z.enum(ARTICLE_CATEGORY_SLUGS, {
    error: "分类不合法",
  }),
  tags: optionalTrimmedString,
  seoTitle: optionalTrimmedString,
  seoDescription: optionalTrimmedString,
  status: z.enum(ARTICLE_STATUS_VALUES, {
    error: "状态只能是 draft 或 published",
  }),
  author: optionalTrimmedString,
  publishedAt: optionalNullableDate,
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

export function normalizeArticleInput(input: unknown): ArticleInput {
  const parsed = articleInputSchema.parse(input);

  return {
    ...parsed,
    publishedAt:
      parsed.status === "published" ? parsed.publishedAt ?? new Date() : parsed.publishedAt ?? null,
  };
}

export function formatDateTimeLocal(date: Date | null | undefined) {
  if (!date) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

export function formatArticleDate(date: Date | null | undefined) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function parseArticleTags(tags: string | null | undefined) {
  if (!tags) {
    return [];
  }

  return tags
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderArticleMarkdown(content: string) {
  const rawHtml = marked.parse(content, { async: false });

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "strong",
      "em",
      "blockquote",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "hr",
      "a",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "nofollow noreferrer noopener",
        target: "_blank",
      }),
    },
  });
}

export function getPublishedCategoryBySlug(category: string) {
  if (!isArticleCategorySlug(category)) {
    notFound();
  }

  return ARTICLE_CATEGORIES.find((item) => item.slug === category)!;
}

function shouldUseMockContent() {
  return process.env.NODE_ENV === "development" && !process.env.DATABASE_URL;
}

export async function getPublishedArticlesByCategory(category: ArticleCategorySlug) {
  if (shouldUseMockContent()) {
    return MOCK_PUBLISHED_ARTICLES.filter((article) => article.category === category);
  }

  return prisma.article.findMany({
    where: {
      category,
      status: "published",
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getAllPublishedArticles() {
  if (shouldUseMockContent()) {
    return MOCK_PUBLISHED_ARTICLES;
  }

  return prisma.article.findMany({
    where: {
      status: "published",
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getPublishedArticleBySlug(category: ArticleCategorySlug, slug: string) {
  if (shouldUseMockContent()) {
    return (
      MOCK_PUBLISHED_ARTICLES.find((article) => article.category === category && article.slug === slug) ?? null
    );
  }

  return prisma.article.findFirst({
    where: {
      category,
      slug,
      status: "published",
    },
  });
}

export async function getPublishedArticleMetadata(
  category: ArticleCategorySlug,
  slug: string,
): Promise<Metadata> {
  const article = await getPublishedArticleBySlug(category, slug);

  if (!article) {
    return {};
  }

  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.summary ?? undefined,
    alternates: {
      canonical: `/${article.category}/${article.slug}`,
    },
    openGraph: {
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.summary ?? undefined,
      url: getAbsoluteUrl(`/${article.category}/${article.slug}`),
      type: "article",
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
  };
}

export function getCategoryMetadata(category: ArticleCategorySlug): Metadata {
  const label = getArticleCategoryLabel(category);

  return {
    title: `${label} - 东面山内容中心`,
    description: `浏览东面山${label}栏目下的已发布内容。`,
    alternates: {
      canonical: `/${category}`,
    },
    openGraph: {
      title: `${label} - 东面山内容中心`,
      description: `浏览东面山${label}栏目下的已发布内容。`,
      url: getAbsoluteUrl(`/${category}`),
      type: "website",
    },
  };
}
