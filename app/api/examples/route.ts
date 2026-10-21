import { NextResponse } from "next/server";
import { CmsAuthError, requireAdminApiUser } from "@/lib/auth";
import { seedExamples } from "@/lib/seed-examples";
export async function POST() {
  try {
    await requireAdminApiUser();
    return NextResponse.json({ counts: await seedExamples() });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof CmsAuthError
            ? error.message
            : "导入失败，请先检查数据库连接和表结构。",
      },
      { status: error instanceof CmsAuthError ? error.status : 500 },
    );
  }
}
