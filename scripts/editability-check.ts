import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { prisma } from "../lib/prisma";
import { DEFAULT_SITE_COPY } from "../lib/site-copy-config";
import { parseSiteCopy } from "../lib/site-copy";
import { stringList } from "../lib/content-fields";
async function main() {
  const base = process.env.TEST_BASE_URL || "http://localhost:3100";
  if (
    !process.env.DATABASE_URL?.startsWith("file:") ||
    !/^http:\/\/(localhost|127\.0\.0\.1):/.test(base)
  )
    throw new Error("Local preview only");
  const marker = `editability-${Date.now()}`;
  let cookie = "";
  let uploadedName = "";
  const passed: string[] = [];
  const originals = await prisma.siteSection.findMany({
    where: {
      key: {
        in: [
          "site-copy",
          "category-audience-awareness",
          "search",
          "homepage-hero",
        ],
      },
    },
  });
  const product = await prisma.product.findFirstOrThrow({
    where: { slug: "jie-mian-mu-si" },
  });
  const article = await prisma.article.findUniqueOrThrow({
    where: { id: "example-mature" },
  });
  const html = async (path: string) => {
    const r = await fetch(base + path);
    return { status: r.status, text: await r.text() };
  };
  async function put(path: string, data: unknown, auth = true) {
    const r = await fetch(base + path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(data),
    });
    return { status: r.status, body: await r.json() };
  }
  async function upload(
    content: Uint8Array,
    type: string,
    filename: string,
    auth = true,
  ) {
    const data = new FormData();
    data.set("file", new Blob([new Uint8Array(content)], { type }), filename);
    const r = await fetch(base + "/api/media", {
      method: "POST",
      headers: auth ? { Cookie: cookie } : {},
      body: data,
    });
    return { status: r.status, body: await r.json() };
  }
  function pass(text: string) {
    passed.push(text);
    console.log(`PASS ${text}`);
  }
  let success = false;
  try {
    assert.equal((await put("/api/site-copy", {}, false)).status, 401);
    assert.equal(
      (await upload(new Uint8Array([1]), "image/png", "a.png", false)).status,
      401,
    );
    pass("global copy and upload writes require administrator authentication");
    const login = await fetch(base + "/api/auth/login", {
      method: "POST",
      body: new URLSearchParams({
        username: process.env.CMS_ADMIN_USERNAME!,
        password: process.env.CMS_ADMIN_PASSWORD!,
      }),
      redirect: "manual",
    });
    assert.equal(login.status, 303);
    cookie = login.headers.get("set-cookie")!.split(";")[0];
    assert.equal(
      (
        await upload(
          Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
          "image/jpeg",
          "fake.jpg",
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await upload(
          new Uint8Array(8 * 1024 * 1024 + 1),
          "image/png",
          "large.png",
        )
      ).status,
      413,
    );
    pass("uploads reject disguised SVG and oversized input");
    const image = await sharp({
      create: { width: 48, height: 32, channels: 3, background: "#003b5c" },
    })
      .png()
      .toBuffer();
    const result = await upload(image, "image/png", "sample.png");
    assert.equal(result.status, 201);
    const url = result.body.item.url;
    uploadedName = url.split("/").pop();
    const served = await fetch(base + url);
    assert.equal(served.status, 200);
    assert.equal(served.headers.get("content-type"), "image/webp");
    const metadata = await sharp(
      Buffer.from(await served.arrayBuffer()),
    ).metadata();
    assert.equal(metadata.width, 48);
    assert.equal(
      (
        await prisma.mediaAsset.findUniqueOrThrow({
          where: { name: uploadedName },
        })
      ).content.length > 0,
      true,
    );
    pass("uploaded image is optimized, stored in database and served publicly");
    const copy = {
      ...DEFAULT_SITE_COPY,
      ...parseSiteCopy(originals.find((x) => x.key === "site-copy")?.items),
      "nav.brand": marker + "导航",
      "footer.text": marker + "页脚",
      "search.placeholder": marker + "搜索提示",
      "product.intro": marker + "基础介绍",
      "category.audience-awareness": marker + "栏目名",
      "brand.logo": url,
      "brand.siteTitle": marker + "浏览器标题",
    };
    assert.equal(
      (await put("/api/site-copy", { values: { ...copy, "nav.brand": "" } }))
        .status,
      400,
    );
    assert.equal(
      (
        await put("/api/site-copy", {
          values: { ...copy, "brand.logo": "javascript:alert(1)" },
        })
      ).status,
      400,
    );
    assert.equal((await put("/api/site-copy", { values: copy })).status, 200);
    let page = (await html("/")).text;
    for (const text of [copy["nav.brand"], copy["footer.text"], url])
      assert.ok(page.includes(text), text);
    assert.ok(
      (await html("/chanpin/jie-mian-mu-si")).text.includes(
        copy["product.intro"],
      ),
    );
    assert.ok(
      (await html("/sousuo")).text.includes(copy["search.placeholder"]),
    );
    pass(
      "navigation, footer, logo, product headings and search prompts edit without code changes",
    );
    const section = {
      title: marker + "分类标题",
      eyebrow: marker + "眉标",
      subtitle: marker + "说明",
      body: marker + "正文",
      mediaUrl: url,
      tagsText: marker + "标签",
      items: [
        {
          id: "example",
          title: marker + "条目",
          body: marker + "条目正文",
          mediaUrl: url,
          tagsText: marker + "条目标签",
        },
      ],
      status: "published",
    };
    assert.equal(
      (await put("/api/site-sections/category-audience-awareness", section))
        .status,
      200,
    );
    page = (await html("/audience-awareness")).text;
    for (const text of [
      section.title,
      section.eyebrow,
      section.subtitle,
      section.body,
      section.tagsText,
      section.items[0].title,
      section.items[0].tagsText,
      url,
      copy["category.audience-awareness"],
    ])
      assert.ok(page.includes(text), text);
    pass(
      "category page title, copy, image, tags and item content all reflect CMS saves",
    );
    assert.equal(
      (
        await put("/api/site-sections/search", {
          ...section,
          title: marker + "搜索页标题",
        })
      ).status,
      200,
    );
    page = (await html("/sousuo")).text;
    assert.ok(page.includes(marker + "搜索页标题"));
    assert.ok(page.includes(section.tagsText));
    assert.ok(page.includes(url));
    pass("search page editorial content and images are independently editable");
    assert.equal(
      (
        await put("/api/site-sections/homepage-hero", {
          ...section,
          title: marker + "海报",
          items: [],
        })
      ).status,
      200,
    );
    page = (await html("/")).text;
    for (const text of [marker + "海报", section.tagsText, url])
      assert.ok(page.includes(text));
    await prisma.product.update({
      where: { id: product.id },
      data: { coverImage: url },
    });
    await prisma.article.update({
      where: { id: article.id },
      data: { coverImage: url },
    });
    assert.ok((await html("/chanpin/jie-mian-mu-si")).text.includes(url));
    assert.ok(
      (await html("/audience-awareness/mature-men-35")).text.includes(url),
    );
    pass(
      "same uploaded asset works for homepage, product, article and brand logo",
    );
    assert.equal((await fetch(base + "/api/health")).status, 200);
    await mkdir("output", { recursive: true });
    await writeFile(
      "output/editability-results.json",
      JSON.stringify({ passed, persistenceImage: url }, null, 2),
    );
    success = true;
  } finally {
    for (const key of [
      "site-copy",
      "category-audience-awareness",
      "search",
      "homepage-hero",
    ]) {
      const original = originals.find((x) => x.key === key);
      if (original)
        await prisma.siteSection.update({
          where: { key },
          data: {
            ...original,
            items: JSON.parse(JSON.stringify(original.items)),
            tags: stringList(original.tags),
          },
        });
      else await prisma.siteSection.deleteMany({ where: { key } });
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { coverImage: product.coverImage },
    });
    await prisma.article.update({
      where: { id: article.id },
      data: { coverImage: article.coverImage },
    });
    if (!success && uploadedName)
      await prisma.mediaAsset.deleteMany({ where: { name: uploadedName } });
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
