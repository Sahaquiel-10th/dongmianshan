import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getNextArticleCode, normalizeArticleInput } from "@/lib/articles";
import { CmsAuthError, requireAdminApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  try {
    await requireAdminApiUser();

    const articles = await prisma.article.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      items: articles,
    });
  } catch (error) {
    return handleArticleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();

    const payload = normalizeArticleInput(await request.json());
    const article = await prisma.article.create({
      data: {
        ...payload,
        code: payload.code ?? (await getNextArticleCode()),
      },
    });

    return NextResponse.json(
      {
        item: article,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleArticleError(error);
  }
}
