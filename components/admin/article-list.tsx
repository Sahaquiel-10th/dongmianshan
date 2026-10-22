"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getArticleCategoryLabel, ARTICLE_CATEGORIES } from "@/lib/categories";

type ArticleListItem = {
  id: string;
  code: string | null;
  title: string;
  category: string;
  status: string;
  deletedAt: Date | string | null;
  updatedAt: Date | string;
};

type ArticleListProps = {
  articles: ArticleListItem[];
  initialCategory?: string;
  categoryLabels?: Record<string, string>;
};

export function ArticleList({
  articles,
  initialCategory = "",
  categoryLabels,
}: ArticleListProps) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const filtered = articles.filter(
    (a) =>
      (!category || a.category === category) &&
      (!query.trim() || `${a.title} ${a.code ?? ""}`.includes(query.trim())),
  );
  const newHref = category
    ? `/admin/articles/new?category=${category}`
    : "/admin/articles/new";
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("确定要把这篇文章移入回收站吗？");

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
      setErrorMessage(
        error instanceof Error ? error.message : "删除文章失败。",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="cms-admin-table-wrap">
      <div className="cms-admin-table-toolbar">
        <Link
          className="cms-admin-button cms-admin-button-primary"
          href={newHref}
        >
          新建文章
        </Link>
        <Link className="cms-admin-button" href="/admin/articles/trash">
          回收站
        </Link>
      </div>
      <div className="editor-list-filters">
        <label>
          官网栏目
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">全部栏目</option>
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {categoryLabels?.[c.slug] ?? c.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          找标题或编号
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入官网上看到的标题"
          />
        </label>
        <span>{filtered.length} 篇</span>
      </div>

      {errorMessage ? (
        <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="cms-admin-empty-state">
          <p>当前条件下没有文章，可调整筛选或新建内容。</p>
          <Link
            className="cms-admin-button cms-admin-button-primary"
            href={newHref}
          >
            去新建
          </Link>
        </div>
      ) : (
        <table className="cms-admin-table">
          <thead>
            <tr>
              <th>编号</th>
              <th>标题</th>
              <th>分类</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((article) => (
              <tr key={article.id}>
                <td>{article.code ?? "-"}</td>
                <td>{article.title}</td>
                <td>
                  {categoryLabels?.[article.category] ??
                    getArticleCategoryLabel(article.category)}
                </td>
                <td>{article.status === "published" ? "已发布" : "草稿"}</td>
                <td>{new Date(article.updatedAt).toLocaleString("zh-CN")}</td>
                <td>
                  <div className="cms-admin-row-actions">
                    <Link
                      className="cms-admin-button"
                      href={`/admin/articles/${article.id}/preview`}
                    >
                      预览
                    </Link>
                    <Link
                      className="cms-admin-button"
                      href={`/admin/articles/${article.id}/edit`}
                    >
                      编辑
                    </Link>
                    <button
                      className="cms-admin-button cms-admin-button-danger"
                      type="button"
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                    >
                      {deletingId === article.id ? "移入中..." : "移入回收站"}
                    </button>
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
