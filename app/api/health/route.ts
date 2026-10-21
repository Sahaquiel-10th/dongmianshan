import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RELEASE_ID } from "@/lib/release";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await Promise.all([
      prisma.product.findFirst({
        select: {
          usage: true,
          features: true,
          ingredients: true,
          relatedArticleIds: true,
          isExample: true,
        },
      }),
      prisma.article.findFirst({
        select: { relatedProductSlugs: true, isExample: true },
      }),
      prisma.siteSection.findFirst({ select: { tags: true } }),
      prisma.mediaAsset.count(),
    ]);
    return NextResponse.json(
      { status: "ok", release: RELEASE_ID },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "unavailable", release: RELEASE_ID },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
