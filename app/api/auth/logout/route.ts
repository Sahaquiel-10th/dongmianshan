import { logoutAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  await logoutAdmin();
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/admin/login",
    },
  });
}
