import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { CmsAuthError, requireAdminApiUser } from "@/lib/auth";
import { MAX_IMAGE_BYTES, MAX_STORED_IMAGE_BYTES } from "@/lib/media";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    await requireAdminApiUser();
    if (
      Number(request.headers.get("content-length")) >
      MAX_IMAGE_BYTES + 1024 * 1024
    )
      return NextResponse.json(
        { error: "图片不能超过 8 MB。" },
        { status: 413 },
      );
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File) || !file.size)
      return NextResponse.json({ error: "请选择图片。" }, { status: 400 });
    if (file.size > MAX_IMAGE_BYTES)
      return NextResponse.json(
        { error: "图片不能超过 8 MB。" },
        { status: 413 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const png = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const gif = /^GIF8[79]a/.test(bytes.subarray(0, 6).toString("ascii"));
    const webp =
      bytes.subarray(0, 4).toString() === "RIFF" &&
      bytes.subarray(8, 12).toString() === "WEBP";
    if (!png && !jpg && !gif && !webp)
      return NextResponse.json(
        { error: "支持 JPG、PNG、WebP 和 GIF 图片，不支持 SVG 或其他文件。" },
        { status: 400 },
      );
    let optimized: Buffer;
    try {
      optimized = await sharp(bytes, { limitInputPixels: 40000000 })
        .rotate()
        .resize({
          width: 2560,
          height: 2560,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      return NextResponse.json(
        { error: "图片损坏或尺寸过大，请换一张图片。" },
        { status: 400 },
      );
    }
    if (optimized.length > MAX_STORED_IMAGE_BYTES)
      return NextResponse.json(
        { error: "图片优化后仍然过大，请降低分辨率后重试。" },
        { status: 413 },
      );
    const name = `${randomUUID()}.webp`;
    await prisma.mediaAsset.create({
      data: {
        name,
        content: new Uint8Array(optimized),
        mimeType: "image/webp",
      },
    });
    return NextResponse.json(
      { item: { url: `/media/${name}` } },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof CmsAuthError
            ? error.message
            : "上传失败，请检查数据库连接和图片表是否就绪。",
      },
      { status: error instanceof CmsAuthError ? error.status : 500 },
    );
  }
}
