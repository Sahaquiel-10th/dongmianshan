import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CmsAuthError, requireAdminApiUser } from "@/lib/auth";
import { normalizeProductInput } from "@/lib/products";
import { prisma } from "@/lib/prisma";

type ProductRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const RETENTION_DAYS = 15;

function handleError(error: unknown) {
  if (error instanceof CmsAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "提交的数据不合法。" }, { status: 400 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json({ error: "Slug 已存在，请更换后重试。" }, { status: 409 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return NextResponse.json({ error: "产品不存在。" }, { status: 404 });
  }

  return NextResponse.json({ error: error instanceof Error ? error.message : "服务器内部错误。" }, { status: 500 });
}

function isExpired(deletedAt: Date | null) {
  if (!deletedAt) {
    return false;
  }

  return Date.now() - deletedAt.getTime() > RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

export async function PUT(request: Request, context: ProductRouteContext) {
  try {
    await requireAdminApiUser();

    const { id } = await context.params;
    const payload = normalizeProductInput(await request.json());
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...payload,
        benefits: payload.benefits,
        scenes: payload.scenes,
      },
    });

    return NextResponse.json({ item: product });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: ProductRouteContext) {
  try {
    await requireAdminApiUser();

    const { id } = await context.params;
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "draft",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(_request: Request, context: ProductRouteContext) {
  try {
    await requireAdminApiUser();

    const { id } = await context.params;
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "产品不存在。" }, { status: 404 });
    }

    if (isExpired(existing.deletedAt)) {
      return NextResponse.json({ error: "该内容已超过 15 天保留期，不能恢复。" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });

    return NextResponse.json({ item: product });
  } catch (error) {
    return handleError(error);
  }
}
