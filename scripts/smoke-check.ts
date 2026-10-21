import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
import { prisma } from "../lib/prisma";
import { stringList } from "../lib/content-fields";
async function main() {
  const base = process.env.TEST_BASE_URL || "http://localhost:3100";
  if (
    !process.env.DATABASE_URL?.startsWith("file:") ||
    !/^http:\/\/(localhost|127\.0\.0\.1):/.test(base)
  )
    throw new Error(
      "Run smoke checks only against the isolated local preview database/server.",
    );
  const marker = `smoke-${Date.now()}`;
  let cookie = "";
  const passed: string[] = [];
  async function api(
    path: string,
    method = "GET",
    payload?: unknown,
    authenticated = true,
  ) {
    const r = await fetch(base + path, {
      method,
      headers: {
        ...(authenticated ? { Cookie: cookie } : {}),
        ...(payload ? { "Content-Type": "application/json" } : {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
      redirect: "manual",
    });
    return { r, data: await r.json() };
  }
  async function html(path: string) {
    const r = await fetch(base + path);
    return { r, text: await r.text() };
  }
  function pass(s: string) {
    passed.push(s);
    console.log(`PASS ${s}`);
  }
  let aid = "";
  let pid = "";
  const originals = await prisma.product.findMany();
  const faq = await prisma.siteSection.findUniqueOrThrow({
    where: { key: "faq" },
  });
  try {
    const unauth = await api("/api/products", "POST", {}, false);
    assert.equal(unauth.r.status, 401);
    assert.equal((await api("/api/articles", "POST", {}, false)).r.status, 401);
    assert.equal(
      (await api("/api/site-sections/faq", "PUT", {}, false)).r.status,
      401,
    );
    assert.equal((await api("/api/examples", "POST", {}, false)).r.status, 401);
    pass("anonymous CMS writes rejected");
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
    const p = {
      name: marker,
      slug: marker,
      summary: marker,
      subtitle: marker,
      routineStep: "测试步骤",
      coverImage: "",
      shopUrl: "https://example.com/official",
      usage: marker + "使用方法",
      features: marker + "特性",
      ingredients: marker + "成分",
      benefits: [marker + "功效"],
      scenes: [],
      relatedArticleIds: [],
      isExample: true,
      status: "draft",
      sortOrder: 50,
    };
    let result = await api("/api/products", "POST", p);
    assert.equal(result.r.status, 201);
    pid = result.data.item.id;
    assert.equal((await html(`/chanpin/${marker}`)).r.status, 404);
    result = await api(`/api/products/${pid}`, "PUT", {
      ...p,
      status: "published",
    });
    assert.equal(result.r.status, 200);
    const detail = await html(`/chanpin/${marker}`);
    assert.equal(detail.r.status, 200);
    for (const word of [
      p.usage,
      p.features,
      p.ingredients,
      p.benefits[0],
      "基础介绍",
      "官方渠道购买",
    ])
      assert.ok(detail.text.includes(word), word);
    assert.ok((await html("/goumai")).text.includes(p.shopUrl));
    pass("five product fields and purchase URL persist to public pages");
    const a = {
      title: marker + "知识",
      slug: marker,
      category: "core-ingredients",
      content: marker + "正文",
      summary: marker + "摘要",
      relatedArticleIds: ["example-mature"],
      relatedProductSlugs: [marker],
      isExample: true,
      status: "published",
    };
    result = await api("/api/articles", "POST", a);
    assert.equal(result.r.status, 201);
    aid = result.data.item.id;
    assert.ok((await html(`/chanpin/${marker}`)).text.includes(a.title));
    assert.ok(
      (await html(`/core-ingredients/${marker}`)).text.includes(
        `/chanpin/${marker}`,
      ),
    );
    assert.ok(
      (await html("/audience-awareness/mature-men-35")).text.includes(a.title),
    );
    pass("knowledge links render in both directions including backlinks");
    result = await api(`/api/articles/${aid}`, "PUT", {
      ...a,
      status: "draft",
    });
    assert.equal(result.r.status, 200);
    assert.ok(!(await html(`/chanpin/${marker}`)).text.includes(a.title));
    assert.ok(!(await html(`/sousuo?q=${marker}`)).text.includes(a.title));
    pass("draft knowledge absent from relations and search");
    await api(`/api/articles/${aid}/publish`, "POST");
    await api(`/api/articles/${aid}`, "DELETE");
    assert.equal((await html(`/core-ingredients/${marker}`)).r.status, 404);
    assert.ok(!(await html(`/chanpin/${marker}`)).text.includes(a.title));
    pass("deleted knowledge cannot leak into published relations");
    const changedFaq = {
      ...faq,
      title: marker + "FAQ",
      body: marker + "FAQ正文",
      items: [
        {
          id: "test-item",
          title: marker + "问答",
          body: marker + "答复",
          deletedAt: new Date().toISOString(),
        },
      ],
    };
    result = await api("/api/site-sections/faq", "PUT", changedFaq);
    assert.equal(result.r.status, 200);
    let publicFaq = (await html("/changjianwenti")).text;
    assert.ok(publicFaq.includes(changedFaq.title));
    assert.ok(publicFaq.includes(changedFaq.body));
    assert.ok(!publicFaq.includes(marker + "问答"));
    await api("/api/site-sections/faq", "PUT", {
      ...changedFaq,
      status: "draft",
    });
    assert.ok(!(await html("/changjianwenti")).text.includes(changedFaq.title));
    pass("section body, item deletion and draft status match public output");
    await prisma.product.updateMany({ data: { status: "draft" } });
    assert.ok(
      !(await html("/chanpin")).text.includes("/chanpin/jie-mian-mu-si"),
    );
    assert.ok(!(await html("/goumai")).text.includes("https://e.tb.cn"));
    pass("unpublishing all products does not resurrect fallback examples");
    const first = originals[0];
    await prisma.product.update({
      where: { id: first.id },
      data: { summary: marker, deletedAt: new Date(), status: "draft" },
    });
    result = await api("/api/examples", "POST");
    assert.equal(result.r.status, 200);
    const reread = await prisma.product.findUniqueOrThrow({
      where: { id: first.id },
    });
    assert.equal(reread.summary, marker);
    assert.ok(reread.deletedAt);
    assert.equal(reread.status, "draft");
    pass("example initialization preserves edits and deletion states");
    const search = await html(
      "/sousuo?q=" + encodeURIComponent("我三十五岁了早上脸上油用什么"),
    );
    assert.ok(search.text.includes("35 岁"));
    assert.ok(search.text.includes("早上脸上油"));
    pass("meeting's natural-language query finds age and concern pages");
  } finally {
    if (aid) await prisma.article.deleteMany({ where: { id: aid } });
    if (pid) await prisma.product.deleteMany({ where: { id: pid } });
    for (const p of originals) {
      const { id, ...data } = p;
      await prisma.product.update({
        where: { id },
        data: {
          ...data,
          benefits: stringList(data.benefits),
          scenes: stringList(data.scenes),
          relatedArticleIds: stringList(data.relatedArticleIds),
        },
      });
    }
    await prisma.siteSection.update({
      where: { key: "faq" },
      data: {
        ...faq,
        tags: stringList(faq.tags),
        items: JSON.parse(JSON.stringify(faq.items)),
      },
    });
    await prisma.$disconnect();
    await mkdir("output", { recursive: true });
    await writeFile(
      "output/smoke-results.json",
      JSON.stringify({ base, passed }, null, 2),
    );
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
