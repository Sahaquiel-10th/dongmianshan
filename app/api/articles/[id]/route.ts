import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { normalizeArticleInput } from "@/lib/articles";
import { CmsAuthError, requireAdminApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ArticleRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const RETENTION_DAYS = 15;

function handleArticleError(error: unknown) {
  if (error instanceof CmsAuthError) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: error.issues[0]?.message ?? "提交的数据不合法。",
      },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json(
      {
        error: "Slug 或文章编号已存在，请更换后重试。",
      },
      { status: 409 },
    );
  }

  if (error instanceof Error) {
    const status = error.message.includes("CMS 配置缺失") || error.message.includes("CMS_SESSION_SECRET")
      ? 500
      : 400;

    return NextResponse.json(
      {
        error: error.message,
      },
      { status },
    );
  }

  return NextResponse.json(
    {
      error: "服务器内部错误。",
    },
    { status: 500 },
  );
}

export async function GET(_request: Request, context: ArticleRouteContext) {
  try {
    await requireAdminApiUser();

    const { id } = await context.params;
    const article = await prisma.article.findUnique({
      where: {
        id,
      },
    });

    if (!article) {
      return NextResponse.json(
        {
          error: "文章不存在。",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      item: article,
    });
  } catch (error) {
    return handleArticleError(error);
  }
}

export async function PUT(request: Request, context: ArticleRouteContext) {
  try {
    await requireAdminApiUser();

    const { id } = await context.params;
    const payload = normalizeArticleInput(await request.json());
    const article = await prisma.article.update({
      where: {
        id,
      },
      data: payload,
    });

    return NextResponse.json({
      item: article,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "文章不存在。",
        },
        { status: 404 },
      );
    }

    return handleArticleError(error);
  }
}

export async function DELETE(_request: Request, context: ArticleRouteContext) {
  try {
    await requireAdminApiUser();

    const { id } = await context.params;

    await prisma.article.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        status: "draft",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "文章不存在。",
        },
        { status: 404 },
      );
    }

    return handleArticleError(error);
  }
}

export async function PATCH(_request: Request, context: ArticleRouteContext) {
  try {
    await requireAdminApiUser();

    const { id } = await context.params;
    const existing = await prisma.article.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "文章不存在。",
        },
        { status: 404 },
      );
    }

    if (
      existing.deletedAt &&
      Date.now() - existing.deletedAt.getTime() > RETENTION_DAYS * 24 * 60 * 60 * 1000
    ) {
      return NextResponse.json(
        {
          error: "该内容已超过 15 天保留期，不能恢复。",
        },
        { status: 400 },
      );
    }

    const article = await prisma.article.update({
      where: {
        id,
      },
      data: {
        deletedAt: null,
      },
    });

    return NextResponse.json({
      item: article,
    });
  } catch (error) {
    return handleArticleError(error);
  }
}
