import { ARTICLE_CATEGORIES } from "./categories";
import type { SiteCopy, SiteCopyKey } from "./site-copy-config";
import { categoryCopy } from "./site-copy-config";
import type { SiteSectionKey } from "./site-sections";

export type EditorPage = {
  id: string;
  path: string;
  label: string;
  copyKey?: SiteCopyKey;
  group: "main" | "brand" | "products" | "care" | "more";
  sections: SiteSectionKey[];
  category?: string;
};
const categoryNavKeys: Record<string, SiteCopyKey> = {
  "brand-introduction": "nav.brandStory",
  "audience-awareness": "nav.audience",
  "problem-solving": "nav.concerns",
  "usage-guide": "nav.usage",
  "core-ingredients": "nav.ingredients",
  "skincare-science": "nav.science",
};
const categoryOrder = [
  "brand-introduction",
  "audience-awareness",
  "problem-solving",
  "usage-guide",
  "core-ingredients",
  "skincare-science",
  "selection-guide",
  "relationship-gifting",
  "product-description",
  "other",
];
export const EDITOR_PAGES: EditorPage[] = [
  {
    id: "home",
    path: "/",
    label: "首页",
    group: "main",
    sections: ["homepage-hero", "homepage-products", "homepage-ingredients"],
  },
  {
    id: "brand",
    path: "/guanyudongmianshan",
    label: "品牌",
    copyKey: "nav.brand",
    group: "main",
    sections: ["about"],
  },
  {
    id: "products",
    path: "/chanpin",
    label: "产品",
    copyKey: "nav.products",
    group: "main",
    sections: ["products-intro"],
  },
  {
    id: "care",
    path: "/hufuzhishi",
    label: "护理指导",
    copyKey: "nav.care",
    group: "main",
    sections: ["education"],
  },
  {
    id: "purchase",
    path: "/goumai",
    label: "官方购买",
    copyKey: "nav.purchase",
    group: "main",
    sections: ["purchase"],
  },
  ...[...ARTICLE_CATEGORIES]
    .sort(
      (a, b) => categoryOrder.indexOf(a.slug) - categoryOrder.indexOf(b.slug),
    )
    .map((c) => ({
      id: c.slug,
      path: `/${c.slug}`,
      label: c.label,
      copyKey: categoryNavKeys[c.slug] ?? (`category.${c.slug}` as SiteCopyKey),
      group:
        c.slug === "brand-introduction"
          ? ("brand" as const)
          : c.slug === "product-description"
            ? ("products" as const)
            : ("care" as const),
      category: c.slug,
      sections: [
        c.slug === "core-ingredients"
          ? "ingredients"
          : (`category-${c.slug}` as SiteSectionKey),
      ],
    })),
  {
    id: "contact",
    path: "/lianxiwomen",
    label: "联系我们",
    copyKey: "nav.contact",
    group: "more",
    sections: ["contact"],
  },
  {
    id: "faq",
    path: "/changjianwenti",
    label: "常见问题",
    copyKey: "nav.faq",
    group: "more",
    sections: ["faq"],
  },
  {
    id: "search",
    path: "/sousuo",
    label: "搜索",
    copyKey: "nav.search",
    group: "more",
    sections: ["search"],
  },
];
export const getEditorPage = (id: string) =>
  EDITOR_PAGES.find((p) => p.id === id);
export const getSectionPage = (key: string) =>
  EDITOR_PAGES.find((p) => p.sections.includes(key as SiteSectionKey));
export const editorPageName = (page: EditorPage, copy: SiteCopy) =>
  page.category ? categoryCopy(copy, page.category) : page.copyKey
    ? copy[page.copyKey]
    : page.id === "home"
      ? copy["common.home"]
      : page.label;
export const editorCategoryLabels = (copy: SiteCopy) =>
  Object.fromEntries(
    EDITOR_PAGES.filter((p) => p.category).map((p) => [
      p.category!,
      editorPageName(p, copy),
    ]),
  );
export const editorPageHref = (id: string) => `/admin/pages/${id}`;
export const sectionEditorHref = (key: string) => `/admin/sections/${key}`;
export function editorPreviewHref(path: string) {
  const url = new URL(path, "https://editor.invalid");
  url.searchParams.set("edit", "1");
  return `${url.pathname}${url.search}${url.hash}`;
}
export function editorPageFromPath(path: string) {
  return (
    EDITOR_PAGES.find((p) => p.path === path) ??
    (path.startsWith("/chanpin/")
      ? getEditorPage("products")
      : EDITOR_PAGES.find((p) => p.category && path.startsWith(`${p.path}/`)))
  );
}
export function editorPublicReturnPath(
  value: string | undefined,
  fallback: string,
) {
  if (!value?.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://editor.invalid");
    if (
      url.origin !== "https://editor.invalid" ||
      !editorPageFromPath(url.pathname)
    )
      return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
export const SECTION_POSITIONS: Record<string, string> = {
  "homepage-hero": "页面最上方 · 大幅海报",
  "homepage-products": "海报与四个入口下方 · 产品区",
  "homepage-ingredients": "产品区下方 · 原料知识区",
  "products-intro": "产品页面上方 · 标题、图片与说明",
  education: "护理指导上方说明与下方入口卡片",
  ingredients: "核心原料页面上方说明与补充卡片",
  about: "品牌页面上方说明与下方内容卡片",
  purchase: "官方购买上方说明与渠道卡片",
  contact: "联系我们页面",
  faq: "常见问题页面",
  search: "搜索框上方说明与补充卡片",
};
export const sectionPosition = (key: string) =>
  SECTION_POSITIONS[key] ?? "栏目页面上方说明与补充卡片";
export function sectionSources(
  key: string,
): { kind: "products" | "articles"; category?: string; label: string } | null {
  if (["homepage-products", "products-intro", "purchase"].includes(key))
    return {
      kind: "products",
      label: key === "purchase" ? "产品购买入口" : "产品卡片",
    };
  if (["homepage-ingredients", "ingredients"].includes(key))
    return {
      kind: "articles",
      category: "core-ingredients",
      label: "原料知识卡片",
    };
  if (key.startsWith("category-"))
    return {
      kind: "articles",
      category: key.slice(9),
      label: "这个栏目下的文章",
    };
  return null;
}
