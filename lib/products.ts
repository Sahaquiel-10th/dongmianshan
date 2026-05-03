import { Prisma } from "@prisma/client";
import { z } from "zod";
import { products as fallbackProducts } from "./homepage";
import { prisma } from "./prisma";

export const PRODUCT_STATUS_VALUES = ["draft", "published"] as const;

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable().optional());

const csvToList = z.preprocess((value) => {
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
}, z.array(z.string().trim().min(1)).max(8, "最多填写 8 项"));

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "产品名称不能为空").max(80, "产品名称不能超过 80 个字符"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug 不能为空")
    .max(120, "Slug 不能超过 120 个字符")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 只能包含小写字母、数字和短横线"),
  subtitle: optionalTrimmedString,
  summary: z.string().trim().max(180, "简介建议控制在 180 字以内").nullable().optional(),
  routineStep: optionalTrimmedString,
  coverImage: optionalTrimmedString,
  shopUrl: optionalTrimmedString,
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
  benefits: string[];
  scenes: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
};

function listFromJson(value: Prisma.JsonValue | null | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
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
  benefits: Prisma.JsonValue | null;
  scenes: Prisma.JsonValue | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}): SiteProduct {
  const fallback = fallbackProducts.find((item) => item.slug === product.slug);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortName: product.name.replace(/^东面山/, "") || product.name,
    routineStep: product.routineStep ?? fallback?.routineStep ?? "",
    subtitle: product.subtitle ?? fallback?.subtitle ?? "",
    summary: product.summary ?? fallback?.summary ?? "",
    image: product.coverImage ?? fallback?.image ?? "",
    shopUrl: product.shopUrl ?? fallback?.shopUrl ?? "",
    benefits: listFromJson(product.benefits).length > 0 ? listFromJson(product.benefits) : fallback?.benefits ?? [],
    scenes: listFromJson(product.scenes).length > 0 ? listFromJson(product.scenes) : fallback?.scenes ?? [],
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
  };
}

function fallbackSiteProducts() {
  return fallbackProducts.map((product) => ({
    ...product,
    image: product.image,
  }));
}

export async function getPublishedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "published",
        deletedAt: null,
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    return products.length > 0 ? products.map(toSiteProduct) : fallbackSiteProducts();
  } catch {
    return fallbackSiteProducts();
  }
}

export async function getPublishedProductBySlug(slug: string) {
  const products = await getPublishedProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
