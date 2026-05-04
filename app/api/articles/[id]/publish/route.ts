import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { CmsAuthError, requireAdminApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PublishArticleRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function handlePublishError(error: unknown) {
  if (error instanceof CmsAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return NextResponse.json({ error: "文章不存在。" }, { status: 404 });
  }

  return NextResponse.json({ error: error instanceof Error ? error.message : "服务器内部错误。" }, { status: 500 });
}

export async function POST(_request: Request, context: PublishArticleRouteContext) {
  try {
    await requireAdminApiUser();

    const { id } = await context.params;
    const article = await prisma.article.update({
      where: {
        id,
      },
      data: {
        status: "published",
        publishedAt: new Date(),
        deletedAt: null,
      },
    });

    return NextResponse.json({
      item: article,
    });
  } catch (error) {
    return handlePublishError(error);
  }
}
