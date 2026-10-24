import { z } from "zod";
import { normalizeContentUrl, contentUrlError, type ContentUrlKind } from "./content-url";

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
function addressSchema(kind: ContentUrlKind) {
  return z.string().transform(normalizeContentUrl).superRefine((value, ctx) => {
    const error = contentUrlError(value, kind);
    if (error) ctx.addIssue({ code: "custom", message: error });
  });
}
export const contentLink = addressSchema("link");
export const contentImage = addressSchema("image");
export const optionalContentImage = contentImage.transform((value) => value || null).nullable().optional();
