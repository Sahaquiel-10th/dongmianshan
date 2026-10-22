import { getSiteCopy } from "@/lib/site-copy";
import { categoryCopy } from "@/lib/site-copy-config";
import Link from "next/link";
import type { Article } from "@prisma/client";
import {
  formatArticleDate,
  getPublishedCategoryBySlug,
  parseArticleTags,
} from "@/lib/articles";
import { ArticleActions } from "@/components/site/editor-tools";

type ArticleCardProps = {
  article: Article;
};

export async function ArticleCard({ article }: ArticleCardProps) {
  const copy = await getSiteCopy();
  const category = getPublishedCategoryBySlug(article.category);
  const tags = parseArticleTags(article.tags);

  return (
    <article className="cms-content-card">
      <div className="cms-content-card-meta">
        <span>
          {categoryCopy(copy, category.slug)}
          {article.isExample ? ` · ${copy["common.example"]}` : ""}
        </span>
        {article.publishedAt ? (
          <span>{formatArticleDate(article.publishedAt)}</span>
        ) : null}
      </div>

      <h2 className="cms-content-card-title">
        <Link href={`/${article.category}/${article.slug}`}>
          {article.title}
        </Link>
      </h2>

      {article.summary ? (
        <p className="cms-content-card-summary">{article.summary}</p>
      ) : null}

      {tags.length > 0 ? (
        <div className="cms-content-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      <div className="cms-content-card-footer">
        <Link
          className="cms-content-link"
          href={`/${article.category}/${article.slug}`}
        >
          {copy["common.read"]}
        </Link>
      </div>
      <ArticleActions article={{ id: article.id, title: article.title, category: article.category, slug: article.slug }} />
    </article>
  );
}
