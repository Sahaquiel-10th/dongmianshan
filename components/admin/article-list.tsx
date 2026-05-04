"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getArticleCategoryLabel } from "@/lib/categories";

type ArticleListItem = {
  id: string;
  title: string;
  category: string;
  status: string;
  deletedAt: Date | string | null;
  updatedAt: Date | string;
};

type ArticleListProps = {
  articles: ArticleListItem[];
};

export function ArticleList({ articles }: ArticleListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("确定要删除这篇文章吗？15 天内可一键恢复。");

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "删除文章失败。");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "删除文章失败。");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRestore(id: string) {
    setRestoringId(id);
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
      setRestoringId(null);
    }
  }

  return (
    <div className="cms-admin-table-wrap">
      <div className="cms-admin-table-toolbar">
        <Link className="cms-admin-button cms-admin-button-primary" href="/admin/articles/new">
          新建文章
        </Link>
      </div>

      {errorMessage ? <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p> : null}

      {articles.length === 0 ? (
        <div className="cms-admin-empty-state">
          <p>还没有文章，先创建第一篇内容。</p>
          <Link className="cms-admin-button cms-admin-button-primary" href="/admin/articles/new">
            去新建
          </Link>
        </div>
      ) : (
        <table className="cms-admin-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>分类</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>{article.title}</td>
                <td>{getArticleCategoryLabel(article.category)}</td>
                <td>{article.deletedAt ? "已删除，可恢复" : article.status === "published" ? "已发布" : "草稿"}</td>
                <td>{new Date(article.updatedAt).toLocaleString("zh-CN")}</td>
                <td>
                  <div className="cms-admin-row-actions">
                    {article.deletedAt ? (
                      <button
                        className="cms-admin-button cms-admin-button-primary"
                        type="button"
                        onClick={() => handleRestore(article.id)}
                        disabled={restoringId === article.id}
                      >
                        {restoringId === article.id ? "恢复中..." : "恢复"}
                      </button>
                    ) : (
                      <>
                        <Link className="cms-admin-button" href={`/admin/articles/${article.id}/preview`}>
                          预览
                        </Link>
                        <Link className="cms-admin-button" href={`/admin/articles/${article.id}/edit`}>
                          编辑
                        </Link>
                        <button
                          className="cms-admin-button cms-admin-button-danger"
                          type="button"
                          onClick={() => handleDelete(article.id)}
                          disabled={deletingId === article.id}
                        >
                          {deletingId === article.id ? "删除中..." : "删除"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
