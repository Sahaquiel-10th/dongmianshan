import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
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
  const savedHero = await prisma.siteSection.findUniqueOrThrow({
    where: { key: "homepage-hero" },
  });
  const savedCopy = await prisma.siteSection.findUnique({
    where: { key: "site-copy" },
  });
  const passed: string[] = [];
  const pass = (text: string) => {
    passed.push(text);
    console.log(`PASS ${text}`);
  };
  let cookie = "";
  let temporaryArticleId: string | undefined;
  const html = async (path: string, auth = true) => {
    const r = await fetch(base + path, {
      headers: auth ? { Cookie: cookie } : {},
      redirect: "manual",
    });
    return {
      status: r.status,
      body: (await r.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ""),
      location: r.headers.get("location"),
    };
  };
  try {
    assert.equal((await html("/admin/pages/home", false)).status, 307);
    const visitor = await html("/?edit=1", false);
    assert.equal(visitor.status, 200);
    assert.ok(!visitor.body.includes('class="cms-editor-bar"'));
    assert.ok(!visitor.body.includes('class="cms-edit-marker"'));
    pass(
      "public visitors cannot enable editing tools and new editor routes require login",
    );
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
    const temporarySlug = `onsite-editor-check-${Date.now()}`;
    const created = await fetch(base + "/api/articles", {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "官网直接编辑验证", slug: temporarySlug, category: "other", content: "用于验证官网编辑权限与回收站。", status: "published" }),
    });
    assert.equal(created.status, 201);
    temporaryArticleId = (await created.json()).item.id;
    const articlePath = `/other/${temporarySlug}`;
    const visitorDetail = await html(articlePath + "?edit=1", false);
    assert.equal(visitorDetail.status, 200);
    assert.ok(!visitorDetail.body.includes('class="cms-inline-actions"'));
    assert.ok(!(await html("/other", false)).body.includes('class="cms-create-card"'));
    const staffDetail = await html(articlePath);
    assert.ok(staffDetail.body.includes('class="cms-inline-actions"'));
    assert.ok(staffDetail.body.includes("删除文章"));
    assert.ok(staffDetail.body.indexOf("用于验证官网编辑权限与回收站。") < staffDetail.body.indexOf('class="cms-inline-actions"'));
    const staffList = await html("/other");
    assert.ok(staffList.body.includes('class="cms-create-card"'));
    assert.ok(staffList.body.includes("category=other&amp;returnTo=%2Fother"));
    const inlineCreate = await html("/admin/articles/new?category=other&returnTo=%2Fother");
    assert.ok(inlineCreate.body.includes('href="/other"'));
    assert.ok(inlineCreate.body.includes("保存草稿并返回栏目"));
    const inlineEdit = await html(`/admin/articles/${temporaryArticleId}/edit?returnTo=${encodeURIComponent(articlePath)}`);
    assert.ok(inlineEdit.body.includes("保存并返回官网"));
    const rejected = await fetch(`${base}/api/articles/${temporaryArticleId}`, { method: "DELETE" });
    assert.equal(rejected.status, 401);
    assert.equal((await html(articlePath, false)).status, 200);
    const removed = await fetch(`${base}/api/articles/${temporaryArticleId}`, { method: "DELETE", headers: { Cookie: cookie } });
    assert.equal(removed.status, 200);
    const removedRecord = await prisma.article.findUniqueOrThrow({ where: { id: temporaryArticleId } });
    assert.ok(removedRecord.deletedAt);
    assert.equal(removedRecord.status, "draft");
    assert.equal((await html(articlePath, false)).status, 404);
    const emptyStaffList = await html("/other");
    assert.ok(emptyStaffList.body.includes('class="cms-create-card"'));
    assert.ok(!emptyStaffList.body.includes("官网直接编辑验证"));
    const recovered = await fetch(`${base}/api/articles/${temporaryArticleId}`, { method: "PATCH", headers: { Cookie: cookie } });
    assert.equal(recovered.status, 200);
    assert.equal((await prisma.article.findUniqueOrThrow({ where: { id: temporaryArticleId } })).deletedAt, null);
    pass("staff see edit/delete and section creation by default; visitors cannot mutate; deletion can be recovered");
    const home = await html("/admin/pages/home");
    assert.equal(home.status, 200);
    const positions = [
      home.body.indexOf('id="homepage-hero"'),
      home.body.indexOf('id="homepage-products"'),
      home.body.indexOf('id="homepage-ingredients"'),
    ];
    assert.ok(
      positions.every((x) => x >= 0) &&
        positions[0] < positions[1] &&
        positions[1] < positions[2],
    );
    const product = await prisma.product.findFirstOrThrow({
      where: { status: "published", deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
    assert.ok(
      home.body.includes(`/admin/products/${product.id}/edit?from=home`),
    );
    assert.ok(home.body.includes("/?edit=1#products"));
    const source = await html(
      `/admin/products/${product.id}/edit?from=home&returnTo=%2F`,
    );
    assert.ok(source.body.includes("同步位置："));
    assert.ok(source.body.includes('href="/admin/pages/home"'));
    pass(
      "homepage regions follow public order and product cards open the actual shared product record",
    );

    const copyValues = {
      ...DEFAULT_SITE_COPY,
      ...(savedCopy ? parseSiteCopy(savedCopy.items) : {}),
    };
    const changed = { ...copyValues, "nav.care": "护理导航一致性验证" };
    const copyResult = await fetch(base + "/api/site-copy", {
      method: "PUT",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ values: changed }),
    });
    assert.equal(copyResult.status, 200);
    assert.ok((await html("/")).body.includes(changed["nav.care"]));
    assert.ok((await html("/admin")).body.includes(changed["nav.care"]));
    assert.ok(
      (await html("/admin/pages/care")).body.includes(changed["nav.care"]),
    );
    pass(
      "renamed public navigation is also used by the editor, without a second naming system",
    );

    const articles = await prisma.article.findMany({
      where: { deletedAt: null },
    });
    const category = "problem-solving";
    const listing = await html(`/admin/articles?category=${category}`);
    const rows =
      listing.body.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)?.[1] ?? "";
    const included = articles.filter((a) => a.category === category);
    for (const a of included)
      assert.ok(rows.includes(`/admin/articles/${a.id}/edit`));
    for (const a of articles.filter((a) => a.category !== category))
      assert.ok(!rows.includes(`/admin/articles/${a.id}/edit`));
    const create = await html(`/admin/articles/new?category=${category}`);
    const options = [...create.body.matchAll(/<option\b([^>]*)>/g)].map(
      (m) => m[1],
    );
    assert.ok(
      options.some(
        (attrs) =>
          attrs.includes(`value="${category}"`) && attrs.includes("selected"),
      ),
    );
    pass(
      "article lists and new article forms retain the selected public section",
    );

    const slideTitle = "真正显示的海报标题";
    const rootTitle = "不会显示的旧主标题";
    await prisma.siteSection.update({
      where: { key: savedHero.key },
      data: {
        title: rootTitle,
        status: "published",
        mediaUrl: "https://example.test/unused-root.jpg",
        items: [
          {
            id: "editor-workflow-slide",
            title: slideTitle,
            subtitle: "上方小字",
          },
        ],
      },
    });
    const form = await html("/admin/sections/homepage-hero");
    assert.ok(form.body.includes(`value="${slideTitle}"`));
    assert.ok(!form.body.includes(`value="${rootTitle}"`));
    const mappedHero = (await html("/admin/pages/home")).body;
    assert.ok(mappedHero.includes(slideTitle));
    const region = mappedHero.match(
      /<section\b[^>]*id="homepage-hero"[^>]*>([\s\S]*?)<\/section>/,
    )?.[1];
    assert.ok(region);
    assert.ok(
      !region.includes("<img"),
      "cleared slide image must not display the unused parent image",
    );
    const sectionPayload = {
      ...savedHero,
      title: rootTitle,
      status: "published",
      tagsText: stringList(savedHero.tags).join(","),
      items: [
        {
          id: "editor-workflow-slide",
          title: slideTitle + "已保存",
          subtitle: "上方小字",
          body: "下方说明",
          mediaUrl: savedHero.mediaUrl,
        },
      ],
    };
    const save = await fetch(base + "/api/site-sections/homepage-hero", {
      method: "PUT",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify(sectionPayload),
    });
    assert.equal(save.status, 200);
    const publicHero = await html("/");
    assert.ok(publicHero.body.includes(`<h1>${slideTitle}已保存</h1>`));
    pass(
      "multi-image hero editor exposes the fields actually shown on the site and saves reflect publicly",
    );
  } finally {
    if (temporaryArticleId) await prisma.article.deleteMany({ where: { id: temporaryArticleId } });
    await prisma.siteSection.update({
      where: { key: savedHero.key },
      data: {
        ...savedHero,
        tags: stringList(savedHero.tags),
        items: JSON.parse(JSON.stringify(savedHero.items)),
      },
    });
    if (savedCopy)
      await prisma.siteSection.update({
        where: { key: "site-copy" },
        data: {
          ...savedCopy,
          tags: stringList(savedCopy.tags),
          items: JSON.parse(JSON.stringify(savedCopy.items)),
        },
      });
    else await prisma.siteSection.deleteMany({ where: { key: "site-copy" } });
    await prisma.$disconnect();
    await mkdir("output", { recursive: true });
    await writeFile(
      "output/editor-workflow-results.json",
      JSON.stringify({ base, passed }, null, 2),
    );
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
