import { loginAdmin, verifyAdminCredentials } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function redirectTo(path: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: path,
    },
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const result = verifyAdminCredentials(username, password);

  if (!result.ok) {
    return redirectTo(`/admin/login?error=${encodeURIComponent(result.error)}`);
  }

  await loginAdmin(username);

  return redirectTo("/admin");
}
