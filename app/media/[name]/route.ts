import { prisma } from "@/lib/prisma";
import { isMediaName } from "@/lib/media";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!isMediaName(name)) return new Response(null, { status: 404 });
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { name } });
    if (!asset) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(asset.content), {
      headers: {
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
