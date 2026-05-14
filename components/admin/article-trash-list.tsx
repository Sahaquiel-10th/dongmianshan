"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getArticleCategoryLabel } from "@/lib/categories";

type ArticleTrashItem = {
  id: string;
  code: string | null;
  title: string;
  category: string;
  deletedAt: Date | string | null;
  updatedAt: Date | string;
};

export function ArticleTrashList({ articles }: { articles: ArticleTrashItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function restoreArticle(id: string) {
    setBusyId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "恢复文章失败。");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "恢复文章失败。");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="cms-admin-table-wrap">
      {errorMessage ? <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p> : null}
      {articles.length === 0 ? (
        <div className="cms-admin-empty-state">
          <p>回收站里暂无文章。</p>
          <Link className="cms-admin-button" href="/admin/articles">
            返回文章管理
          </Link>
        </div>
      ) : (
        <table className="cms-admin-table">
          <thead>
            <tr>
              <th>编号</th>
              <th>标题</th>
              <th>分类</th>
              <th>删除时间</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>{article.code ?? "-"}</td>
                <td>{article.title}</td>
                <td>{getArticleCategoryLabel(article.category)}</td>
                <td>{article.deletedAt ? new Date(article.deletedAt).toLocaleString("zh-CN") : "-"}</td>
                <td>{new Date(article.updatedAt).toLocaleString("zh-CN")}</td>
                <td>
                  <button
                    className="cms-admin-button cms-admin-button-primary"
                    type="button"
                    onClick={() => restoreArticle(article.id)}
                    disabled={busyId === article.id}
                  >
                    {busyId === article.id ? "恢复中..." : "恢复到文章列表"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
