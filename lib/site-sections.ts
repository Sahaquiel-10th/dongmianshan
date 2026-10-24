import { z } from "zod";
import { placeholderImages } from "./homepage";
import { stringList } from "./content-fields";
import { contentLink, contentImage } from "./content-fields";
import { normalizeContentUrl } from "./content-url";
import { ARTICLE_CATEGORIES, type ArticleCategorySlug } from "./categories";
import { prisma } from "./prisma";

export const SITE_SECTION_CONFIGS = [
  {
    key: "search",
    label: "辅助页面 · 搜索页",
    location: "/sousuo",
    hint: "维护搜索页标题、说明、配图、标签与补充入口。搜索框及结果提示在全站文案中维护。",
    itemLabel: "搜索补充内容",
  },
  ...ARTICLE_CATEGORIES.filter((c) => c.slug !== "core-ingredients").map(
    (c) => ({
      key: `category-${c.slug}` as `category-${ArticleCategorySlug}`,
      label: `护理栏目 · ${c.label}`,
      location: `/${c.slug}`,
      hint: "维护这个分类页自己的标题、说明、主图、标签和补充内容。分类名称在全站文案中维护。",
      itemLabel: "栏目补充内容",
    }),
  ),
  {
    key: "homepage-hero",
    label: "首页 · 海报",
    location: "/#homepage-hero",
    hint: "首页海报；标题、说明、主图和按钮逐项对应官网。多张海报用条目维护。",
    itemLabel: "海报",
  },
  {
    key: "homepage-products",
    label: "首页 · 产品领域",
    location: "/#products",
    hint: "编辑首页产品区标题与说明。产品图、介绍和顺序请到产品管理修改。",
    itemLabel: "补充入口",
  },
  {
    key: "homepage-ingredients",
    label: "首页 · 核心原料",
    location: "/#ingredients",
    hint: "编辑首页原料区标题与说明。具体原料词条请在文章管理的核心原料分类编辑。",
    itemLabel: "补充入口",
  },
  {
    key: "products-intro",
    label: "产品 · 列表页",
    location: "/chanpin",
    hint: "编辑产品列表页介绍。五项产品信息及购买链接在产品管理中编辑。",
    itemLabel: "补充入口",
  },
  {
    key: "education",
    label: "护理指导 · 入口",
    location: "/hufuzhishi",
    hint: "条目为可编辑的二级入口，填写站内链接。正文用于说明如何从人群走到产品。",
    itemLabel: "护理入口",
  },
  {
    key: "ingredients",
    label: "护理指导 · 原料入口",
    location: "/core-ingredients",
    hint: "编辑核心原料列表标题和说明。原料详情在文章管理中编辑。",
    itemLabel: "补充入口",
  },
  {
    key: "about",
    label: "品牌 · 理念",
    location: "/guanyudongmianshan",
    hint: "编辑品牌理念、背景、故事与研发介绍；每个条目对应官网一个内容块。",
    itemLabel: "品牌内容",
  },
  {
    key: "purchase",
    label: "官方购买 · 渠道说明",
    location: "/goumai",
    hint: "渠道条目可维护名称、说明和链接。每款产品的直购链接由产品管理统一维护。",
    itemLabel: "购买渠道",
  },
  {
    key: "contact",
    label: "辅助页面 · 联系我们",
    location: "/lianxiwomen",
    hint: "维护联系与售后信息，可用条目填写不同联系方式。",
    itemLabel: "联系信息",
  },
  {
    key: "faq",
    label: "辅助页面 · 常见问题",
    location: "/changjianwenti",
    hint: "一个条目对应一组问答；详细说明可链接到护理文章。",
    itemLabel: "问答",
  },
] as const;
export type SiteSectionKey = (typeof SITE_SECTION_CONFIGS)[number]["key"];
export const SITE_SECTION_KEYS = SITE_SECTION_CONFIGS.map((x) => x.key) as [
  SiteSectionKey,
  ...SiteSectionKey[],
];
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
  tags?: string[];
  items: SiteSectionItem[];
};
const optionalText = z.string().trim().optional().nullable();
type Addresses = { mediaUrl?: string | null; ctaUrl?: string | null };
function validateAddresses(value: Addresses, ctx: z.RefinementCtx) {
  for (const field of ["mediaUrl", "ctaUrl"] as const) {
    const schema = field === "mediaUrl" ? contentImage : contentLink;
    if (value[field] == null) continue;
    const parsed = schema.safeParse(value[field]);
    if (!parsed.success) for (const issue of parsed.error.issues)
      ctx.addIssue({ code: "custom", path: [field], message: issue.message });
  }
}
function normalizeAddresses<T extends Addresses>(value: T): T {
  return {
    ...value,
    mediaUrl: typeof value.mediaUrl === "string" ? normalizeContentUrl(value.mediaUrl) : value.mediaUrl,
    ctaUrl: typeof value.ctaUrl === "string" ? normalizeContentUrl(value.ctaUrl) : value.ctaUrl,
  };
}
const itemSchema = z.object({
  id: optionalText,
  title: z.string().trim().min(1, "条目标题不能为空").max(80),
  subtitle: optionalText,
  body: z.string().trim().max(1500).optional().nullable(),
  mediaUrl: optionalText,
  ctaLabel: optionalText,
  ctaUrl: optionalText,
  tagsText: optionalText,
  deletedAt: optionalText,
}).superRefine((item, ctx) => {
  if (item.deletedAt) return;
  validateAddresses(item, ctx);
}).transform(normalizeAddresses);
export const siteSectionInputSchema = z.object({
  tagsText: optionalText,
  key: z.enum(SITE_SECTION_KEYS),
  title: z.string().trim().min(1, "板块标题不能为空").max(80),
  eyebrow: optionalText,
  subtitle: z.string().trim().max(500).optional().nullable(),
  body: z.string().trim().max(3000).optional().nullable(),
  mediaUrl: optionalText,
  ctaLabel: optionalText,
  ctaUrl: optionalText,
  status: z.enum(["draft", "published"]),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  items: z.array(itemSchema).max(12),
}).superRefine((section, ctx) => {
  // In carousel mode the old single-banner URLs aren't shown or used.
  if (section.key === "homepage-hero" && section.items.some((item) => !item.deletedAt)) return;
  validateAddresses(section, ctx);
}).transform(normalizeAddresses);
export type SiteSectionInput = z.infer<typeof siteSectionInputSchema>;
const clean = (x: string | null | undefined) => x?.trim() || null;
export function normalizeSiteSectionInput(input: unknown) {
  const { tagsText, ...parsed } = siteSectionInputSchema.parse(input);
  return {
    ...parsed,
    tags: (tagsText ?? "")
      .split(/[,，\n]/)
      .map((x) => x.trim())
      .filter(Boolean),
    eyebrow: clean(parsed.eyebrow),
    subtitle: clean(parsed.subtitle),
    body: clean(parsed.body),
    mediaUrl: clean(parsed.mediaUrl),
    ctaLabel: clean(parsed.ctaLabel),
    ctaUrl: clean(parsed.ctaUrl),
    items: parsed.items
      .filter(
        (x) =>
          !x.deletedAt ||
          Date.now() - new Date(x.deletedAt).getTime() < 15 * 86400000,
      )
      .map((x) => ({
        id: clean(x.id) || crypto.randomUUID(),
        title: x.title,
        subtitle: clean(x.subtitle) ?? undefined,
        body: clean(x.body) ?? undefined,
        mediaUrl: clean(x.mediaUrl) ?? undefined,
        ctaLabel: clean(x.ctaLabel) ?? undefined,
        ctaUrl: clean(x.ctaUrl) ?? undefined,
        tags: (x.tagsText ?? "")
          .split(/[,，\n]/)
          .map((s) => s.trim())
          .filter(Boolean),
        deletedAt: x.deletedAt ?? null,
      })),
  };
}
export const getSectionConfig = (key: string) =>
  SITE_SECTION_CONFIGS.find((x) => x.key === key) ?? null;
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
  tags?: unknown;
}): SiteSectionContent {
  return {
    ...section,
    key: section.key as SiteSectionKey,
    tags: stringList(section.tags),
    items: Array.isArray(section.items)
      ? (section.items as SiteSectionItem[])
      : [],
  };
}
export const fallbackSections: Record<SiteSectionKey, SiteSectionContent> = {
  ...(Object.fromEntries(
    ARTICLE_CATEGORIES.map((c) => [
      `category-${c.slug}`,
      {
        key: `category-${c.slug}`,
        title: c.label,
        eyebrow: "护理指导",
        subtitle: "从这里找到你的问题，继续了解相关原料、护理方法与产品。",
        status: "published" as const,
        items: [] as SiteSectionItem[],
      },
    ]),
  ) as Record<`category-${ArticleCategorySlug}`, SiteSectionContent>),
  search: {
    key: "search",
    title: "把你的问题，放在这里",
    eyebrow: "站内搜索",
    status: "published",
    items: [],
  },
  "homepage-hero": {
    key: "homepage-hero",
    eyebrow: "东方熟龄肌男士护理",
    title: "懂你的肌肤，让护理更简单",
    subtitle: "从人群与需求出发，了解清洁、补水、保湿，找到自己的日常护理。",
    mediaUrl: placeholderImages.cleanser,
    ctaLabel: "找到我的护理方向",
    ctaUrl: "/hufuzhishi",
    status: "published",
    items: [],
  },
  "homepage-products": {
    key: "homepage-products",
    eyebrow: "产品领域",
    title: "三步，回到日常",
    subtitle: "先了解每一步，再选择适合自己的产品。",
    ctaLabel: "查看全部产品",
    ctaUrl: "/chanpin",
    status: "published",
    items: [],
  },
  "homepage-ingredients": {
    key: "homepage-ingredients",
    eyebrow: "核心原料",
    title: "看懂原料，也看懂自己的需求",
    subtitle: "原料是什么、与熟龄男士有什么关系，从这里继续了解。",
    ctaLabel: "了解核心原料",
    ctaUrl: "/core-ingredients",
    status: "published",
    items: [],
  },
  "products-intro": {
    key: "products-intro",
    eyebrow: "产品",
    title: "清洁、补水、保湿，三步讲清楚",
    subtitle: "了解基础介绍、使用方法、特性、原料成分与功能功效，再做选择。",
    status: "published",
    items: [],
  },
  education: {
    key: "education",
    eyebrow: "护理指导",
    title: "从你的问题，找到护理方向",
    subtitle:
      "我是什么人群？当下有什么需求？从一个问题出发，顺着关联了解原料、方法与产品。",
    body: "人群与年龄 → 需求与困扰 → 原料与知识 → 对应产品",
    status: "published",
    items: [
      {
        id: "audience",
        title: "从人群与年龄开始",
        body: "例如：35 岁的熟龄男士，怎么认识自己的肌肤需求？",
        ctaLabel: "了解人群",
        ctaUrl: "/audience-awareness",
      },
      {
        id: "concerns",
        title: "从需求与困扰开始",
        body: "例如：早上脸上油，除了清洁，还要了解什么？",
        ctaLabel: "找到我的问题",
        ctaUrl: "/problem-solving",
      },
      {
        id: "ingredients",
        title: "从核心原料开始",
        body: "认识氨基酸、人参皂苷等原料主题。",
        ctaLabel: "了解原料",
        ctaUrl: "/core-ingredients",
      },
      {
        id: "routine",
        title: "从使用方法开始",
        body: "清洁、补水、保湿，如何放进日常。",
        ctaLabel: "了解使用方法",
        ctaUrl: "/usage-guide",
      },
      {
        id: "science",
        title: "从护肤知识开始",
        body: "用容易理解的知识，帮助自己做选择。",
        ctaLabel: "阅读护肤知识",
        ctaUrl: "/skincare-science",
      },
    ],
  },
  ingredients: {
    key: "ingredients",
    eyebrow: "核心原料",
    title: "原料与人群，放在一起理解",
    subtitle: "从是什么、作用依据，到与熟龄肌需求的关系。",
    status: "published",
    items: [],
  },
  about: {
    key: "about",
    eyebrow: "品牌",
    title: "专注东方熟龄肌男士护理",
    subtitle: "成熟男性需要的不是复杂步骤，而是一套能长期执行的日常护理。",
    status: "published",
    items: [
      {
        id: "story",
        title: "品牌理念",
        body: "东面山从熟龄男性的真实需求出发，让理解护肤、选择产品和建立习惯都更简单。",
      },
      {
        id: "research",
        title: "研发与原料",
        body: "从清洁、补水、保湿的基础需求开始，把原料与产品讲清楚。",
      },
    ],
  },
  purchase: {
    key: "purchase",
    eyebrow: "官方购买",
    title: "了解清楚，直接购买",
    subtitle: "通过下方产品链接进入原有官方购买渠道。",
    status: "published",
    items: [],
  },
  contact: {
    key: "contact",
    eyebrow: "联系我们",
    title: "品牌咨询与售后",
    subtitle: "联系方式正在完善，也可先通过官方购买渠道联系店铺客服。",
    ctaLabel: "进入官方购买",
    ctaUrl: "/goumai",
    status: "published",
    items: [],
  },
  faq: {
    key: "faq",
    eyebrow: "常见问题",
    title: "选择与使用前，先了解这些",
    status: "published",
    items: [
      {
        id: "order",
        title: "三款产品的使用顺序是什么？",
        body: "洁面慕斯、精华水、精华乳，按清洁、补水、保湿的顺序了解。具体用量和频次请以包装说明为准。",
        ctaLabel: "查看产品说明",
        ctaUrl: "/chanpin",
      },
      {
        id: "buy",
        title: "在哪里购买？",
        body: "产品详情页和官方购买页均可直接进入购买链接。",
        ctaLabel: "官方购买",
        ctaUrl: "/goumai",
      },
    ],
  },
};
export const getFallbackSection = (key: SiteSectionKey) =>
  fallbackSections[key];
export async function getPublishedSiteSection(
  key: SiteSectionKey,
): Promise<SiteSectionContent> {
  if (!process.env.DATABASE_URL) return getFallbackSection(key);
  const section = await prisma.siteSection.findUnique({ where: { key } });
  if (!section) return getFallbackSection(key);
  if (section.status !== "published") {
    const { getSiteCopy } = await import("./site-copy");
    const { getSectionPage, editorPageName } = await import("./editor-map");
    const copy = await getSiteCopy();
    const page = getSectionPage(key);
    return {
      key,
      title: copy["empty.page"],
      eyebrow: page ? editorPageName(page, copy) : copy["brand.name"],
      status: "draft",
      items: [],
    };
  }
  const content = toSectionContent(section);
  return { ...content, items: content.items.filter((item) => !item.deletedAt) };
}

export async function getSectionMetadata(
  key: SiteSectionKey,
  canonical: string,
) {
  const { getSiteCopy } = await import("./site-copy");
  const [section, copy] = await Promise.all([
    getPublishedSiteSection(key),
    getSiteCopy(),
  ]);
  return {
    title: `${section.title} - ${copy["brand.name"]}`,
    description: section.subtitle || undefined,
    alternates: { canonical },
  };
}
