import { NextResponse } from "next/server";
import { isDevPreviewAuthAvailable, loginAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  if (!isDevPreviewAuthAvailable()) {
    return NextResponse.json(
      {
        error: "当前环境不允许使用临时测试登录。",
      },
      { status: 403 },
    );
  }

  await loginAdmin("dev-preview");

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/admin",
    },
  });
}
