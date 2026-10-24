import assert from "node:assert/strict";
import { contentLink, contentImage, stringList } from "../lib/content-fields";
import { normalizeContentUrl } from "../lib/content-url";
import { normalizeSiteSectionInput } from "../lib/site-sections";
import { normalizeProductInput } from "../lib/products";
import { normalizeArticleInput } from "../lib/articles";
import { DEFAULT_SITE_COPY } from "../lib/site-copy-config";
import { parseSiteCopy } from "../lib/site-copy";
import { prisma } from "../lib/prisma";

const signed = "media.example.com/中文图%2F1.jpg?OSSAccessKeyId=AbC&Signature=a%2Bb%2Fc%3D&token=a+b&x=1&x=2#part";
for (const [input, expected] of [
  ["", ""], ["  www.example.com/shop  ", "https://www.example.com/shop"],
  ["e.tb.cn/h.example?tk=AbC", "https://e.tb.cn/h.example?tk=AbC"],
  ["//cdn.example.com/img.jpg", "https://cdn.example.com/img.jpg"],
  ["HTTPS://example.com/path", "https://example.com/path"],
  ["https：／／example.com/path", "https://example.com/path"],
  ["例子.中国/产品", "https://例子.中国/产品"],
  ["/chanpin", "/chanpin"], ["#products", "#products"], ["?q=35岁", "?q=35岁"],
  ["http://127.0.0.1:3100/chanpin", "http://127.0.0.1:3100/chanpin"],
  [signed, `https://${signed}`],
]) {
  assert.equal(contentLink.parse(input), expected);
  assert.equal(normalizeContentUrl(expected), expected, "normalization must be idempotent");
}
for (const input of ["javascript:alert(1)", "data:text/html,x", "ftp://example.com/a", "not a url", "htps://example.com", "https://", "/\\evil.example", "https://example.com\n/secret"])
  assert.equal(contentLink.safeParse(input).success, false, input);
assert.equal(contentImage.safeParse("#products").success, false);
assert.equal(contentImage.safeParse("?q=1").success, false);
assert.equal(contentImage.parse("cdn.example.com/a.jpg"), "https://cdn.example.com/a.jpg");

const sectionInput = { key: "homepage-hero", title: "链接验证", status: "published", items: [
  { id: "url-check", title: "海报", mediaUrl: signed, ctaUrl: "www.example.com/shop" },
] };
const normalized = normalizeSiteSectionInput({ ...sectionInput, ctaUrl: "old invalid unused URL", mediaUrl: "old invalid unused image" });
assert.equal(normalized.items[0].ctaUrl, "https://www.example.com/shop");
assert.equal(normalized.items[0].mediaUrl, `https://${signed}`);
assert.throws(() => normalizeSiteSectionInput({ ...sectionInput, items: [{ ...sectionInput.items[0], ctaUrl: "javascript:alert(1)" }] }));
assert.doesNotThrow(() => normalizeSiteSectionInput({ ...sectionInput, items: [...sectionInput.items, { id: "deleted", title: "已删除", deletedAt: new Date().toISOString(), ctaUrl: "old invalid url" }] }));
assert.throws(() => normalizeSiteSectionInput({ ...sectionInput, items: [], ctaUrl: "invalid url" }));
assert.equal(normalizeProductInput({ name: "测试", slug: "url-check", status: "draft", coverImage: signed, shopUrl: "e.tb.cn/h.test" }).coverImage, `https://${signed}`);
assert.equal(normalizeArticleInput({ title: "测试", slug: "url-check", category: "other", content: "正文", status: "draft", coverImage: signed }).coverImage, `https://${signed}`);
console.log("PASS address normalization preserves paths and signed parameters; all active schemas validate consistently");

async function main() {
  const base = process.env.TEST_BASE_URL || "http://localhost:3100";
  if (!process.env.DATABASE_URL?.startsWith("file:") || !/^http:\/\/(localhost|127\.0\.0\.1):/.test(base)) throw Error("Local preview only");
  const hero = await prisma.siteSection.findUniqueOrThrow({ where: { key: "homepage-hero" } });
  const copy = await prisma.siteSection.findUnique({ where: { key: "site-copy" } });
  let productId: string | undefined, articleId: string | undefined;
  const login = await fetch(base + "/api/auth/login", { method: "POST", body: new URLSearchParams({ username: process.env.CMS_ADMIN_USERNAME!, password: process.env.CMS_ADMIN_PASSWORD! }), redirect: "manual" });
  assert.equal(login.status, 303);
  const cookie = login.headers.get("set-cookie")!.split(";")[0];
  async function write(path: string, payload: unknown, method = "PUT") {
    const r = await fetch(base + path, { method, headers: { Cookie: cookie, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    return { status: r.status, data: await r.json() };
  }
  try {
    const saved = await write("/api/site-sections/homepage-hero", { ...sectionInput, ctaUrl: "old unused URL" });
    assert.equal(saved.status, 200);
    assert.equal(saved.data.item.items[0].ctaUrl, "https://www.example.com/shop");
    assert.equal(saved.data.item.items[0].mediaUrl, `https://${signed}`);
    const html = await (await fetch(base + "/")).text();
    assert.ok(html.includes('href="https://www.example.com/shop"'));
    const bad = await write("/api/site-sections/homepage-hero", { ...sectionInput, items: [{ ...sectionInput.items[0], ctaUrl: "not a url" }] });
    assert.equal(bad.status, 400);
    assert.match(bad.data.error, /第 1 个条目.*这个按钮打开的网址/);
    const stored = await prisma.siteSection.findUniqueOrThrow({ where: { key: "homepage-hero" } });
    assert.deepEqual(stored.items, saved.data.item.items, "failed validation must leave saved content intact");
    const marker = `url-check-${Date.now()}`;
    const product = await write("/api/products", { name: "链接验证", slug: marker, status: "draft", shopUrl: "e.tb.cn/h.test", coverImage: signed }, "POST");
    productId = product.data.item?.id;
    assert.equal(product.status, 201);
    assert.equal(product.data.item.shopUrl, "https://e.tb.cn/h.test");
    assert.equal(product.data.item.coverImage, `https://${signed}`);
    const article = await write("/api/articles", { title: "链接验证", slug: marker, category: "other", content: "测试正文", status: "draft", coverImage: signed }, "POST");
    articleId = article.data.item?.id;
    assert.equal(article.status, 201);
    assert.equal(article.data.item.coverImage, `https://${signed}`);
    const logo = await write("/api/site-copy", { values: { ...DEFAULT_SITE_COPY, ...(copy ? parseSiteCopy(copy.items) : {}), "brand.logo": "cdn.example.com/logo.png" } });
    assert.equal(logo.status, 200);
    const storedCopy = await prisma.siteSection.findUniqueOrThrow({ where: { key: "site-copy" } });
    assert.equal(parseSiteCopy(storedCopy.items)["brand.logo"], "https://cdn.example.com/logo.png");
    console.log("PASS APIs persist corrected banner, purchase, cover and logo URLs; invalid active links identify the exact item");
  } finally {
    if (productId) await prisma.product.deleteMany({ where: { id: productId } });
    if (articleId) await prisma.article.deleteMany({ where: { id: articleId } });
    await prisma.siteSection.update({ where: { key: hero.key }, data: { ...hero, tags: stringList(hero.tags), items: JSON.parse(JSON.stringify(hero.items)) } });
    if (copy) await prisma.siteSection.update({ where: { key: copy.key }, data: { ...copy, tags: stringList(copy.tags), items: JSON.parse(JSON.stringify(copy.items)) } });
    else await prisma.siteSection.deleteMany({ where: { key: "site-copy" } });
    await prisma.$disconnect();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
