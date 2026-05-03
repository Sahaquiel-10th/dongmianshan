import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CmsAuthError, requireAdminApiUser } from "@/lib/auth";
import { getSectionConfig, normalizeSiteSectionInput } from "@/lib/site-sections";
import { prisma } from "@/lib/prisma";

type SectionRouteContext = {
  params: Promise<{
    key: string;
  }>;
};

function handleError(error: unknown) {
  if (error instanceof CmsAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "提交的数据不合法。" }, { status: 400 });
  }

  return NextResponse.json({ error: error instanceof Error ? error.message : "服务器内部错误。" }, { status: 500 });
}

export async function PUT(request: Request, context: SectionRouteContext) {
  try {
    await requireAdminApiUser();

    const { key } = await context.params;
    const config = getSectionConfig(key);

    if (!config) {
      return NextResponse.json({ error: "板块不存在。" }, { status: 404 });
    }

    const payload = normalizeSiteSectionInput({
      ...(await request.json()),
      key,
    });
    const section = await prisma.siteSection.upsert({
      where: { key },
      update: {
        title: payload.title,
        eyebrow: payload.eyebrow,
        subtitle: payload.subtitle,
        body: payload.body,
        mediaUrl: payload.mediaUrl,
        ctaLabel: payload.ctaLabel,
        ctaUrl: payload.ctaUrl,
        items: payload.items,
        status: payload.status,
        sortOrder: payload.sortOrder,
      },
      create: {
        key,
        title: payload.title,
        eyebrow: payload.eyebrow,
        subtitle: payload.subtitle,
        body: payload.body,
        mediaUrl: payload.mediaUrl,
        ctaLabel: payload.ctaLabel,
        ctaUrl: payload.ctaUrl,
        items: payload.items,
        status: payload.status,
        sortOrder: payload.sortOrder,
      },
    });

    return NextResponse.json({ item: section });
  } catch (error) {
    return handleError(error);
  }
}
