import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderArticleMarkdown(content: string) {
  const rawHtml = marked.parse(content, { async: false });

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "strong",
      "em",
      "blockquote",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "hr",
      "a",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "nofollow noreferrer noopener",
        target: "_blank",
      }),
    },
  });
}
