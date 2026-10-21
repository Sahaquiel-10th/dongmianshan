import { z } from "zod";

export const referenceList = z.preprocess(
  (value) =>
    Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value
            .split(/[,，\n]/)
            .map((x) => x.trim())
            .filter(Boolean)
        : [],
  z
    .array(z.string().trim().min(1))
    .max(12, "最多关联 12 项")
    .transform((xs) => [...new Set(xs)]),
);
export function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === "string")
    : [];
}
export const contentLink = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    if (/^\/(?!\/)/.test(value) && !value.includes("\\")) return true;
    try {
      return ["https:", "http:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "请填写站内路径或完整的 http/https 链接");
