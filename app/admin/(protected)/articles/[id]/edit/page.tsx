import { IncomingLinks } from "@/components/admin/incoming-links";
import { stringList } from "@/lib/content-fields";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleForm } from "@/components/admin/article-form";
import {
  formatDateTimeLocal,
  serializeRelatedArticleIds,
} from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { EditorContext } from "@/components/admin/editor-context";
import {
  getEditorPage,
  editorPageHref,
  editorCategoryLabels,
  editorPublicReturnPath,
} from "@/lib/editor-map";
import { getSiteCopy } from "@/lib/site-copy";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ from?: string; returnTo?: string }>;
};

export default async function EditArticlePage({
  params,
  searchParams,
}: EditArticlePageProps) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: {
      id,
    },
  });

  if (!article) {
    notFound();
  }
  const query = await searchParams;
  const origin =
    getEditorPage(query.from ?? article.category) ?? getEditorPage("care")!;
  const copy = await getSiteCopy();
  const categoryLabels = editorCategoryLabels(copy);
  const returnTo = query.returnTo ? editorPublicReturnPath(query.returnTo, `/${article.category}`) : undefined;

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header cms-admin-panel-header-row">
        <div>
          <p className="editor-kicker">文章卡片与详情页</p>
          <h2>{article.title}</h2>
          <p>标题和摘要用于栏目卡片；封面与正文用于打开后的文章详情。</p>
        </div>
        <Link className="cms-admin-button" href={returnTo ?? editorPageHref(origin.id)}>
          {returnTo ? "返回官网原位置" : "返回页面内容"}
        </Link>
      </div>

      <EditorContext
        pageId={origin.id}
        title={article.title}
        publicPath={editorPublicReturnPath(
          query.returnTo,
          query.from ? origin.path : `/${article.category}/${article.slug}`,
        )}
        shared="所在栏目列表、文章详情，以及引用这篇文章的首页卡片和知识关联。"
      />
      <IncomingLinks
        articleId={article.id}
        ownArticleIds={stringList(article.relatedArticleIds)}
        ownProductSlugs={stringList(article.relatedProductSlugs)}
      />
      <ArticleForm
        categoryLabels={categoryLabels}
        mode="edit"
        articleId={article.id}
        returnTo={returnTo}
        initialValues={{
          relatedProductSlugs: serializeRelatedArticleIds(
            article.relatedProductSlugs,
          ),
          isExample: article.isExample,
          code: article.code ?? "",
          title: article.title,
          slug: article.slug,
          summary: article.summary ?? "",
          category: article.category,
          tags: article.tags ?? "",
          coverImage: article.coverImage ?? "",
          content: article.content,
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
          relatedArticleIds: serializeRelatedArticleIds(
            article.relatedArticleIds,
          ),
          status: article.status,
          author: article.author ?? "",
          publishedAt: formatDateTimeLocal(article.publishedAt),
        }}
      />
    </section>
  );
}
