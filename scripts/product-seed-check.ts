import assert from "node:assert/strict";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

async function main() {
  const source = process.env.DATABASE_URL;
  if (!source?.startsWith("file:")) throw new Error("Local SQLite fixture only");
  const folder = await mkdtemp(join(tmpdir(), "dongmianshan-seed-check-"));
  const copy = join(folder, "fixture.db");
  await copyFile(fileURLToPath(source), copy);
  process.env.DATABASE_URL = pathToFileURL(copy).href;
  const { prisma } = await import("../lib/prisma");
  const { seedExamples } = await import("../lib/seed-examples");
  const { fallbackSiteProducts, getMergedProductRedirect } = await import("../lib/products");
  const { ORIGINAL_PRODUCT_SLUGS } = await import("../lib/product-example-merge");
  const samples = fallbackSiteProducts();
  async function clear() {
    await prisma.product.deleteMany();
    await prisma.article.deleteMany();
    await prisma.siteSection.deleteMany();
  }
  async function originals(deleted = false) {
    for (const [index, p] of samples.entries())
      await prisma.product.create({ data: {
        slug: ORIGINAL_PRODUCT_SLUGS[p.slug], name: `原有产品-${p.name}`,
        summary: "原有正式介绍，不能被覆盖", usage: "原有使用方法",
        relatedArticleIds: ["existing-knowledge"], status: "published", sortOrder: index,
        deletedAt: deleted ? new Date() : null,
      } });
  }
  try {
    await clear();
    await originals();
    await seedExamples();
    assert.equal(await prisma.product.count(), 3);
    for (const p of await prisma.product.findMany()) {
      assert.equal(p.summary, "原有正式介绍，不能被覆盖");
      assert.equal(p.usage, "原有使用方法");
    }
    for (const a of await prisma.article.findMany())
      assert.ok(!(a.relatedProductSlugs as string[]).some(s => samples.some(p => p.slug === s)));
    console.log("PASS existing catalogue is reused without creating three extra products");

    await clear();
    await seedExamples();
    assert.equal(await prisma.product.count(), 3);
    await originals();
    const result = await seedExamples();
    assert.equal(result.mergedProductExamples, 3);
    assert.equal(await prisma.product.count({ where: { status: "published", deletedAt: null } }), 3);
    assert.equal(await prisma.product.count(), 6); // Draft samples remain recoverable.
    for (const p of samples) {
      const original = await prisma.product.findUniqueOrThrow({ where: { slug: ORIGINAL_PRODUCT_SLUGS[p.slug] } });
      assert.ok((original.relatedArticleIds as string[]).includes("existing-knowledge"));
      assert.ok((original.relatedArticleIds as string[]).length > 1);
      assert.equal(await getMergedProductRedirect(p.slug), original.slug);
    }
    for (const a of await prisma.article.findMany())
      assert.ok(!(a.relatedProductSlugs as string[]).some(s => samples.some(p => p.slug === s)));
    assert.equal((await seedExamples()).mergedProductExamples, 0);
    await prisma.product.update({ where: { slug: samples[0].slug }, data: { status: "published" } });
    await seedExamples();
    assert.equal((await prisma.product.findUniqueOrThrow({ where: { slug: samples[0].slug } })).status, "published");
    console.log("PASS untouched duplicates become drafts once, knowledge links and old URLs are preserved");

    await clear();
    await seedExamples();
    await originals();
    await prisma.product.update({ where: { slug: samples[0].slug }, data: { summary: "运营已修改的内容" } });
    assert.equal((await seedExamples()).mergedProductExamples, 2);
    const edited = await prisma.product.findUniqueOrThrow({ where: { slug: samples[0].slug } });
    assert.equal(edited.summary, "运营已修改的内容");
    assert.equal(edited.status, "published");
    console.log("PASS edited examples and later manual publication choices are preserved");

    await clear();
    await originals(true);
    await seedExamples();
    assert.equal(await prisma.product.count(), 3);
    assert.equal(await prisma.product.count({ where: { status: "published", deletedAt: null } }), 0);
    console.log("PASS deleted originals are not replaced by new sample products");
  } finally {
    await prisma.$disconnect();
    await rm(folder, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
