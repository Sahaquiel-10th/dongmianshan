// Shared by the editor and API. Only fix unambiguous address formatting;
// leave paths, encoded characters and signed query strings unchanged.
export type ContentUrlKind = "link" | "image";

export function normalizeContentUrl(input: string): string {
  const value = input.trim();
  if (/^https?[:：]/i.test(value)) {
    return value.replace(/^(https?)[:：][/／]*/i, (_, scheme: string) => `${scheme.toLowerCase()}://`);
  }
  if (value.startsWith("//")) return `https://${value.replace(/^\/+/, "")}`;
  // A hostname, optional port and optional path. A scheme or plain word is
  // never interpreted as a hostname. URL below validates the actual authority.
  if (/^(?:localhost|\[[\da-f:]+\]|(?:[\p{L}\p{N}-]+\.)+[\p{L}\p{N}-]+)(?::\d+)?(?:[/?#]|$)/iu.test(value)) {
    return `https://${value}`;
  }
  return value;
}

export function contentUrlError(input: string, kind: ContentUrlKind = "link"): string | null {
  const value = normalizeContentUrl(input);
  if (!value) return null;
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return "网址中有换行或反斜杠，请重新粘贴完整地址。";
  if (/^\/(?!\/)/.test(value)) return null;
  if (kind === "link" && /^[#?]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (["https:", "http:"].includes(url.protocol) && url.hostname) return null;
  } catch {
    // The field will explain where the malformed value is.
  }
  return kind === "image"
    ? "请填写图片网址（如 www.example.com/photo.jpg）或站内图片路径。"
    : "请填写网址（如 www.example.com）、站内路径（如 /chanpin）或页内锚点（如 #products）。";
}
