"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ArticlePreviewActionsProps = {
  articleId: string;
  editHref: string;
  publicHref: string;
  isPublished: boolean;
};

export function ArticlePreviewActions({ articleId, editHref, publicHref, isPublished }: ArticlePreviewActionsProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function publishArticle() {
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/articles/${articleId}/publish`, {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "发布文章失败。");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "发布文章失败。");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="cms-admin-preview-actions">
      {errorMessage ? <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p> : null}
      <div className="cms-admin-form-actions">
        <Link className="cms-admin-button" href={editHref}>
          返回编辑
        </Link>
        {isPublished ? (
          <a className="cms-admin-button cms-admin-button-primary" href={publicHref} target="_blank" rel="noreferrer">
            查看前台文章
          </a>
        ) : (
          <button
            className="cms-admin-button cms-admin-button-primary"
            type="button"
            onClick={publishArticle}
            disabled={isPublishing}
          >
            {isPublishing ? "发布中..." : "确认发布"}
          </button>
        )}
      </div>
    </div>
  );
}
