import { z } from "zod";
import { placeholderImages, scienceArticles, testimonials } from "./homepage";
import { prisma } from "./prisma";

export const SITE_SECTION_CONFIGS = [
  {
    key: "homepage-hero",
    label: "首页轮播",
    hint: "建议 1-5 张，图片建议 1920x1080，标题 40 字以内，摘要 120 字以内。",
    itemLabel: "轮播图",
  },
  {
    key: "mens-scenes",
    label: "男士护肤场景",
    hint: "建议上传 1 张横图 1200x900，并维护 2-6 个场景标签。",
    itemLabel: "场景标签",
  },
  {
    key: "skin-science",
    label: "皮肤科普",
    hint: "建议 1 张横图 1200x900，文章卡片可链接到教育文章。",
    itemLabel: "科普入口",
  },
  {
    key: "testimonials",
    label: "用户证言",
    hint: "建议 3-6 条，每条证言 120 字以内。",
    itemLabel: "证言",
  },
  {
    key: "education",
    label: "教育",
    hint: "维护教育入口页的标题、说明和栏目卡片。",
    itemLabel: "栏目入口",
  },
  {
    key: "about",
    label: "关于东面山",
    hint: "维护品牌故事、研发理念等内容块，每块正文建议 300 字以内。",
    itemLabel: "内容块",
  },
  {
    key: "skin-test",
    label: "肌肤测试",
    hint: "维护测试页说明和问题，问题建议 4-8 个。",
    itemLabel: "测试问题",
  },
] as const;

export type SiteSectionKey = (typeof SITE_SECTION_CONFIGS)[number]["key"];

export const SITE_SECTION_KEYS = SITE_SECTION_CONFIGS.map((item) => item.key) as [SiteSectionKey, ...SiteSectionKey[]];

export type SiteSectionItem = {
  id: string;
  title: string;
  subtitle?: string;
  body?: string;
  mediaUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  tags?: string[];
  deletedAt?: string | null;
};

export type SiteSectionContent = {
  key: SiteSectionKey;
  title: string;
  eyebrow?: string | null;
  subtitle?: string | null;
  body?: string | null;
  mediaUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  status: "draft" | "published";
  items: SiteSectionItem[];
};

const sectionItemSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(1, "条目标题不能为空").max(80, "条目标题不能超过 80 字"),
  subtitle: z.string().trim().max(160, "条目副标题不能超过 160 字").optional().nullable(),
  body: z.string().trim().max(500, "条目正文不能超过 500 字").optional().nullable(),
  mediaUrl: z.string().trim().max(500, "媒体链接过长").optional().nullable(),
  ctaLabel: z.string().trim().max(20, "按钮文字不能超过 20 字").optional().nullable(),
  ctaUrl: z.string().trim().max(500, "跳转链接过长").optional().nullable(),
  tagsText: z.string().trim().max(120, "标签总长度不能超过 120 字").optional().nullable(),
  deletedAt: z.string().nullable().optional(),
});

export const siteSectionInputSchema = z.object({
  key: z.enum(SITE_SECTION_KEYS),
  title: z.string().trim().min(1, "板块标题不能为空").max(80, "板块标题不能超过 80 字"),
  eyebrow: z.string().trim().max(30, "眉标不能超过 30 字").optional().nullable(),
  subtitle: z.string().trim().max(180, "副标题不能超过 180 字").optional().nullable(),
  body: z.string().trim().max(800, "正文不能超过 800 字").optional().nullable(),
  mediaUrl: z.string().trim().max(500, "媒体链接过长").optional().nullable(),
  ctaLabel: z.string().trim().max(20, "按钮文字不能超过 20 字").optional().nullable(),
  ctaUrl: z.string().trim().max(500, "跳转链接过长").optional().nullable(),
  status: z.enum(["draft", "published"]),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  items: z.array(sectionItemSchema).max(12, "每个板块最多 12 个条目"),
});

export type SiteSectionInput = z.infer<typeof siteSectionInputSchema>;

function cleanString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeTags(tagsText: string | null | undefined) {
  return (tagsText ?? "")
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function isWithinRetention(deletedAt: string | null | undefined) {
  if (!deletedAt) {
    return true;
  }

  const deletedTime = new Date(deletedAt).getTime();
  return Number.isNaN(deletedTime) || Date.now() - deletedTime <= 15 * 24 * 60 * 60 * 1000;
}

export function normalizeSiteSectionInput(input: unknown) {
  const parsed = siteSectionInputSchema.parse(input);

  return {
    ...parsed,
    eyebrow: cleanString(parsed.eyebrow),
    subtitle: cleanString(parsed.subtitle),
    body: cleanString(parsed.body),
    mediaUrl: cleanString(parsed.mediaUrl),
    ctaLabel: cleanString(parsed.ctaLabel),
    ctaUrl: cleanString(parsed.ctaUrl),
    items: parsed.items
      .filter((item) => isWithinRetention(item.deletedAt))
      .map((item) => ({
        id: item.id?.trim() || crypto.randomUUID(),
        title: item.title,
        subtitle: cleanString(item.subtitle) ?? undefined,
        body: cleanString(item.body) ?? undefined,
        mediaUrl: cleanString(item.mediaUrl) ?? undefined,
        ctaLabel: cleanString(item.ctaLabel) ?? undefined,
        ctaUrl: cleanString(item.ctaUrl) ?? undefined,
        tags: normalizeTags(item.tagsText),
        deletedAt: item.deletedAt ?? null,
      })),
  };
}

export function getSectionConfig(key: string) {
  return SITE_SECTION_CONFIGS.find((section) => section.key === key) ?? null;
}

function liveItems(items: SiteSectionItem[]) {
  return items.filter((item) => !item.deletedAt);
}

function parseItems(value: unknown): SiteSectionItem[] {
  return Array.isArray(value) ? (value as SiteSectionItem[]) : [];
}

export function toSectionContent(section: {
  key: string;
  title: string;
  eyebrow: string | null;
  subtitle: string | null;
  body: string | null;
  mediaUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  status: "draft" | "published";
  items: unknown;
}): SiteSectionContent {
  return {
    key: section.key as SiteSectionKey,
    title: section.title,
    eyebrow: section.eyebrow,
    subtitle: section.subtitle,
    body: section.body,
    mediaUrl: section.mediaUrl,
    ctaLabel: section.ctaLabel,
    ctaUrl: section.ctaUrl,
    status: section.status,
    items: parseItems(section.items),
  };
}

const fallbackSections: Record<SiteSectionKey, SiteSectionContent> = {
  "homepage-hero": {
    key: "homepage-hero",
    title: "东面山洁面慕斯",
    eyebrow: "第一步 清洁",
    subtitle: "为剃须后、出油多、通勤频繁的熟龄男性设计。",
    status: "published",
    items: [],
  },
  "mens-scenes": {
    key: "mens-scenes",
    title: "把护肤放进成熟男性真实的一天",
    eyebrow: "男士护肤场景",
    subtitle:
      "东面山三步方案面向晨间通勤、剃须后、运动后、夜间修护等高频场景，重点解决熟龄男性常见的紧绷、暗沉、粗糙和疲惫感。",
    mediaUrl: placeholderImages.routine,
    ctaLabel: "进入肌肤测试",
    ctaUrl: "/jifuceping",
    status: "published",
    items: ["商务通勤", "剃须敏感", "运动出汗", "熬夜疲惫"].map((title) => ({ id: title, title })),
  },
  "skin-science": {
    key: "skin-science",
    title: "用研究内容回答熟龄男士护肤问题",
    eyebrow: "皮肤科普",
    subtitle: "用科普文章解释屏障、剃须刺激、补水、紧致和成分协同，方便用户理解。",
    mediaUrl: placeholderImages.science,
    status: "published",
    items: scienceArticles.map((article) => ({
      id: article.title,
      title: article.title,
      body: article.summary,
      ctaUrl: article.href,
    })),
  },
  testimonials: {
    key: "testimonials",
    title: "东面山在真实使用场景里被看见",
    eyebrow: "用户证言",
    status: "published",
    items: testimonials.map((item) => ({
      id: item.name,
      title: item.name,
      body: item.quote,
    })),
  },
  education: {
    key: "education",
    title: "护肤知识入口",
    eyebrow: "教育",
    subtitle: "这里承接 skincare education 逻辑，用拼音路径作为中国国内 SEO 的内容入口。",
    status: "published",
    items: [],
  },
  about: {
    key: "about",
    title: "专注东方熟龄肌男士护肤",
    eyebrow: "关于东面山",
    subtitle: "成熟男性需要的不是复杂步骤，而是一套能长期执行、兼顾体面与效率的护理方案。",
    status: "published",
    items: [
      {
        id: "story",
        title: "品牌故事",
        body:
          "东面山从熟龄男性真实护肤困境出发：工作节奏快、剃须频繁、熬夜通勤多、护肤知识门槛高。品牌希望用更清晰的产品结构和更稳妥的配方逻辑，帮助他们建立低负担的护肤习惯。",
      },
      {
        id: "research",
        title: "研发理念",
        body:
          "以温和清洁、补水修护、屏障强韧为基础，再围绕暗沉、细纹、松弛和疲惫感做针对性表达。后续品牌部门可继续补充真实研发资料、备案信息和功效测试内容。",
      },
    ],
  },
  "skin-test": {
    key: "skin-test",
    title: "找到适合你的三步护肤程序",
    eyebrow: "肌肤测试",
    subtitle:
      "通过肤质、剃须频率、出油情况、干纹暗沉、使用场景，最终推荐产品组合和文章内容。",
    status: "published",
    items: ["清洁后是否紧绷", "剃须后是否泛红", "白天是否容易出油", "是否关注细纹轮廓"].map((title) => ({
      id: title,
      title,
    })),
  },
};

export function getFallbackSection(key: SiteSectionKey) {
  return fallbackSections[key];
}

export async function getPublishedSiteSection(key: SiteSectionKey) {
  try {
    const section = await prisma.siteSection.findUnique({
      where: {
        key,
      },
    });

    if (!section || section.status !== "published") {
      return getFallbackSection(key);
    }

    const content = toSectionContent(section);
    return {
      ...content,
      items: liveItems(content.items),
    };
  } catch {
    return getFallbackSection(key);
  }
}
