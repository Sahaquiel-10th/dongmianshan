import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CmsAuthError, requireAdminApiUser } from "@/lib/auth";
import { normalizeProductInput } from "@/lib/products";
import { prisma } from "@/lib/prisma";

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

  return NextResponse.json({ error: error instanceof Error ? error.message : "服务器内部错误。" }, { status: 500 });
}

export async function GET() {
  try {
    await requireAdminApiUser();

    const products = await prisma.product.findMany({
      orderBy: [{ deletedAt: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ items: products });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();

    const payload = normalizeProductInput(await request.json());
    const product = await prisma.product.create({
      data: {
        ...payload,
        benefits: payload.benefits,
        scenes: payload.scenes,
      },
    });

    return NextResponse.json({ item: product }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
