import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { normalizeContentUrl } from "./content-url";
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderArticleMarkdown(content: string) {
  const rawHtml = marked.parse(content, { async: false });

  return sanitizeHtml(rawHtml, {
    // Raw-text containers must be discarded with their contents, even when
    // they are not in the site's allowed tag list.
    nonTextTags: [
      "script", "style", "textarea", "option", "xmp", "noscript",
      "noembed", "noframes", "iframe", "title", "plaintext",
    ],
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
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...attributes,
          ...(attributes.href ? { href: normalizeContentUrl(attributes.href) } : {}),
          rel: "nofollow noreferrer noopener",
          target: "_blank",
        },
      }),
    },
  });
}
