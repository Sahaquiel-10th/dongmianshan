import { renderArticleMarkdown } from "@/lib/articles";

type ArticleBodyProps = {
  content: string;
};

export function ArticleBody({ content }: ArticleBodyProps) {
  const html = renderArticleMarkdown(content);

  return <div className="cms-content-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
