import { Prisma } from "@prisma/client";
import { z } from "zod";
import { products as fallbackProducts } from "./homepage";
import { referenceList, contentLink } from "./content-fields";
import { prisma } from "./prisma";

export const PRODUCT_STATUS_VALUES = ["draft", "published"] as const;

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable().optional());

const csvToList = z.preprocess(
  (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return value
        .split(/[,，\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  },
  z.array(z.string().trim().min(1)).max(8, "最多填写 8 项"),
);

export const productInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "产品名称不能为空")
    .max(80, "产品名称不能超过 80 个字符"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug 不能为空")
    .max(120, "Slug 不能超过 120 个字符")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 只能包含小写字母、数字和短横线"),
  subtitle: optionalTrimmedString,
  summary: z
    .string()
    .trim()
    .max(180, "简介建议控制在 180 字以内")
    .nullable()
    .optional(),
  routineStep: optionalTrimmedString,
  coverImage: optionalTrimmedString,
  shopUrl: contentLink.nullable().optional(),
  usage: optionalTrimmedString,
  features: optionalTrimmedString,
  ingredients: optionalTrimmedString,
  relatedArticleIds: referenceList,
  isExample: z.coerce.boolean().default(false),
  benefits: csvToList,
  scenes: csvToList,
  seoTitle: optionalTrimmedString,
  seoDescription: optionalTrimmedString,
  status: z.enum(PRODUCT_STATUS_VALUES, {
    error: "状态只能是 draft 或 published",
  }),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export function normalizeProductInput(input: unknown): ProductInput {
  return productInputSchema.parse(input);
}

export type SiteProduct = {
  id?: string;
  slug: string;
  name: string;
  shortName: string;
  routineStep: string;
  subtitle: string;
  summary: string;
  image: string;
  shopUrl: string;
  usage: string;
  features: string;
  ingredients: string;
  relatedArticleIds: string[];
  isExample: boolean;
  benefits: string[];
  scenes: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
};

function listFromJson(value: Prisma.JsonValue | null | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function toSiteProduct(product: {
  id?: string;
  slug: string;
  name: string;
  subtitle: string | null;
  summary: string | null;
  routineStep: string | null;
  coverImage: string | null;
  shopUrl: string | null;
  usage?: string | null;
  features?: string | null;
  ingredients?: string | null;
  relatedArticleIds?: Prisma.JsonValue | null;
  isExample?: boolean;
  benefits: Prisma.JsonValue | null;

  scenes: Prisma.JsonValue | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}): SiteProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortName: product.name.replace(/^东面山/, "") || product.name,
    routineStep: product.routineStep ?? "",
    subtitle: product.subtitle ?? "",
    summary: product.summary ?? "",
    image: product.coverImage ?? "",
    shopUrl: product.shopUrl ?? "",
    benefits: listFromJson(product.benefits),
    scenes: listFromJson(product.scenes),
    usage: product.usage ?? "",
    features: product.features ?? "",
    ingredients: product.ingredients ?? "",
    relatedArticleIds: listFromJson(product.relatedArticleIds),
    isExample: product.isExample ?? false,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
  };
}

export function fallbackSiteProducts(): SiteProduct[] {
  return fallbackProducts.map((product) => ({
    ...product,
    usage:
      "示例：洁面、精华水、精华乳依次使用。用量、频次及注意事项请以包装说明为准，待品牌补充正式使用方法。",
    features:
      "示例：围绕清洁、补水、保湿三个步骤介绍产品肤感与使用特点，正式内容待确认。",
    ingredients:
      "原料成分待品牌依据实际包装成分表补充。下方原料知识仅作知识展示，不代表本产品已添加。",
    benefits: ["功能功效待品牌确认"],
    relatedArticleIds:
      product.slug === "jie-mian-mu-si"
        ? ["example-amino", "example-oil", "mock-tutorial-1"]
        : ["example-oil", "mock-tutorial-1"],
    isExample: true,
  }));
}

export async function getPublishedProducts(): Promise<SiteProduct[]> {
  if (!process.env.DATABASE_URL) return fallbackSiteProducts();
  const products = await prisma.product.findMany({
    where: { status: "published", deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  return products.map(toSiteProduct);
}

export async function getPublishedProductBySlug(slug: string) {
  const products = await getPublishedProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
