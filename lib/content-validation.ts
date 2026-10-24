import type { ZodError } from "zod";

const fieldLabels: Record<string, string> = {
  ctaUrl: "这个按钮打开的网址",
  mediaUrl: "图片网址",
  coverImage: "封面图片网址",
  shopUrl: "购买链接",
  "brand.logo": "品牌 Logo 图片网址",
  title: "标题",
};

export function contentValidationMessage(error: ZodError) {
  const issue = error.issues[0];
  if (!issue) return "提交的数据不合法。";
  const field = String(issue.path.at(-1) ?? "");
  const prefix = issue.path[0] === "items" && typeof issue.path[1] === "number"
    ? `第 ${issue.path[1] + 1} 个条目 · ` : "";
  return `${prefix}${fieldLabels[field] ? `${fieldLabels[field]}：` : ""}${issue.message}`;
}
