import assert from "node:assert/strict";
import { renderArticleMarkdown } from "../lib/article-markdown";

const unsafeInputs = [
  '<xmp><script>alert(1)</script><img src=x onerror="alert(1)"></xmp>',
  '<textarea></textarea/><img src=x onerror="alert(1)">',
  '<noscript><p></noscript><img src=x onerror="alert(1)">',
  '<svg><a><animate attributeName="href" values="javascript:alert(1)" /></a></svg>',
  '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
  '<a href="javascript:alert(1)" onclick="alert(1)">unsafe link</a>',
  '<iframe src="javascript:alert(1)"></iframe>',
];

for (const input of unsafeInputs) {
  const html = renderArticleMarkdown(input);
  assert.doesNotMatch(html, /<(?:script|img|svg|animate|iframe|meta|xmp|noscript)\b/i);
  assert.doesNotMatch(html, /\s(?:onerror|onload|onclick)\s*=/i);
  assert.doesNotMatch(html, /href\s*=\s*["']\s*javascript:/i);
}

const article = renderArticleMarkdown(
  "## 使用方法\n\n保留**重点**与说明。\n\n- 早上\n- 晚上\n\n[官方购买](https://www.dongmianshan.cn/goumai)\n\n```js\nconst amount = 1;\n```",
);
assert.match(article, /<h2>使用方法<\/h2>/);
assert.match(article, /<strong>重点<\/strong>/);
assert.match(article, /<li>早上<\/li>/);
assert.match(article, /href="https:\/\/www\.dongmianshan\.cn\/goumai"/);
assert.match(article, /rel="nofollow noreferrer noopener"/);
assert.match(article, /<code class="language-js">/);
assert.match(article, /const amount = 1;/);
console.log("PASS article filtering blocks unsafe HTML and preserves normal Markdown");
const simpleLinks = renderArticleMarkdown("[购买](e.tb.cn/h.test?tk=a%2Bb)\n\n[站内](/chanpin)\n\n[跳转](#products)");
assert.match(simpleLinks, /href="https:\/\/e\.tb\.cn\/h\.test\?tk=a%2Bb"/);
assert.match(simpleLinks, /href="\/chanpin"/);
assert.match(simpleLinks, /href="#products"/);
console.log("PASS Markdown links accept bare domains and keep internal paths and fragments");
