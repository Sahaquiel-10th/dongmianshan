import { NextResponse } from "next/server";
import { logoutAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  await logoutAdmin();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
