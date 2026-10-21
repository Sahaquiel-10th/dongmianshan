import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { CmsAuthError, requireAdminApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contentLink } from "@/lib/content-fields";
import { SITE_COPY_KEYS, DEFAULT_SITE_COPY } from "@/lib/site-copy-config";
const schema = z.object({
  values: z.record(
    z.enum(
      SITE_COPY_KEYS as [
        keyof typeof DEFAULT_SITE_COPY,
        ...(keyof typeof DEFAULT_SITE_COPY)[],
      ],
    ),
    z.string().trim().max(1000),
  ),
});
export async function PUT(request: Request) {
  try {
    await requireAdminApiUser();
    const { values } = schema.parse(await request.json());
    contentLink.parse(values["brand.logo"]);
    for (const key of [
      "brand.name",
      "nav.brand",
      "nav.products",
      "nav.care",
      "nav.purchase",
    ] as const)
      if (!values[key])
        return NextResponse.json(
          { error: "品牌和四个主导航名称不能为空。" },
          { status: 400 },
        );
    for (const token of ["{query}", "{count}"])
      if (!values["search.results"].includes(token))
        return NextResponse.json(
          { error: `搜索结果提示需要保留 ${token}` },
          { status: 400 },
        );
    const items = SITE_COPY_KEYS.map((key) => ({
      id: key,
      title: key,
      body: values[key],
    }));
    await prisma.siteSection.upsert({
      where: { key: "site-copy" },
      create: {
        key: "site-copy",
        title: "全站文案、导航与页脚",
        items,
        status: "published",
      },
      update: { items, status: "published" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof CmsAuthError
            ? error.message
            : error instanceof ZodError
              ? error.issues[0]?.message
              : "保存失败，请检查数据库连接。",
      },
      {
        status:
          error instanceof CmsAuthError
            ? error.status
            : error instanceof ZodError
              ? 400
              : 500,
      },
    );
  }
}
