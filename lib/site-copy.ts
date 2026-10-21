import { cache } from "react";
import { prisma } from "./prisma";
import {
  DEFAULT_SITE_COPY,
  SITE_COPY_KEYS,
  type SiteCopy,
} from "./site-copy-config";
export function parseSiteCopy(items: unknown): SiteCopy {
  const copy: SiteCopy = { ...DEFAULT_SITE_COPY };
  if (Array.isArray(items))
    for (const item of items) {
      if (
        item &&
        SITE_COPY_KEYS.includes(item.id) &&
        typeof item.body === "string"
      )
        copy[item.id as keyof SiteCopy] = item.body;
    }
  return copy;
}
export const getSiteCopy = cache(async (): Promise<SiteCopy> => {
  if (!process.env.DATABASE_URL) return { ...DEFAULT_SITE_COPY };
  const stored = await prisma.siteSection.findUnique({
    where: { key: "site-copy" },
    select: { status: true, items: true },
  });
  return parseSiteCopy(stored?.status === "published" ? stored.items : []);
});
