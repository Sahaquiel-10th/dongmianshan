import Link from "next/link";
import { ArticleTrashList } from "@/components/admin/article-trash-list";
import { prisma } from "@/lib/prisma";

export default async function ArticleTrashPage() {
  let setupError: string | null = null;
  let articles: {
    id: string;
    code: string | null;
    title: string;
    category: string;
    deletedAt: Date | null;
    updatedAt: Date;
  }[] = [];

  try {
    articles = await prisma.article.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        deletedAt: "desc",
      },
      select: {
        id: true,
        code: true,
        title: true,
        category: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
  } catch {
    setupError = "回收站暂时无法读取。通常是线上数据库还没有同步文章编号或 deletedAt 字段，请先执行 npm run prisma:push。";
  }

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header cms-admin-panel-header-row">
        <div>
          <p className="cms-admin-eyebrow">Trash</p>
          <h2>文章回收站</h2>
          <p>已删除文章会集中放在这里，确认需要时再恢复到文章列表。</p>
        </div>
        <Link className="cms-admin-button" href="/admin/articles">
          返回上一级页面
        </Link>
      </div>

      {setupError ? (
        <p className="cms-admin-alert cms-admin-alert-error">
          {setupError} <Link href="/admin/setup">查看数据库检查</Link>
        </p>
      ) : null}
      <ArticleTrashList articles={articles} />
    </section>
  );
}
