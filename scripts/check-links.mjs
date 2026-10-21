import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
const base = process.env.TEST_BASE_URL || "http://localhost:3100";
if (!/^http:\/\/(localhost|127\.0\.0\.1):/.test(base))
  throw new Error("Local checks only");
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const initial = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (m) => new URL(m[1]).pathname,
);
assert.ok(initial.length > 10);
const queue = new Set(initial);
const done = new Map();
const broken = [];
function publicUrl(href, from) {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:"))
    return null;
  const url = new URL(href.replaceAll("&amp;", "&"), base + from);
  if (
    url.origin !== new URL(base).origin ||
    /^\/(admin|api|_next)(\/|$)/.test(url.pathname) ||
    /\.(css|js|svg|png|jpe?g|ico|woff2?)(\?|$)/.test(url.pathname)
  )
    return null;
  return url;
}
while ([...queue].some((x) => !done.has(x))) {
  const batch = [...queue].filter((x) => !done.has(x)).slice(0, 4);
  await Promise.all(
    batch.map(async (path) => {
      const res = await fetch(base + path);
      const body = await res.text();
      done.set(path, res.status);
      if (res.status !== 200) broken.push({ path, status: res.status });
      for (const m of body.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
        const url = publicUrl(m[1], path);
        if (!url) continue;
        queue.add(url.pathname + url.search);
      }
    }),
  );
}
assert.deepEqual(broken, []);
await mkdir("output", { recursive: true });
await writeFile(
  "output/link-results.json",
  JSON.stringify(Object.fromEntries(done), null, 2),
);
console.log(
  `PASS ${done.size} public URLs from sitemap and rendered internal links, zero broken routes`,
);
const legacy = await fetch(base + "/science/mature-skin-barrier-guide", {
  redirect: "manual",
});
assert.ok([307, 308].includes(legacy.status));
const quiz = await fetch(base + "/jifuceping", { redirect: "manual" });
assert.equal(quiz.status, 308);
console.log("PASS legacy category and former quiz entry redirect correctly");
