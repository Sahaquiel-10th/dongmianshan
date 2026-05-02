import { NextResponse } from "next/server";
import { loginAdmin, verifyAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const result = verifyAdminCredentials(username, password);

  if (!result.ok) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", result.error);
    return NextResponse.redirect(loginUrl, 303);
  }

  await loginAdmin(username);

  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
