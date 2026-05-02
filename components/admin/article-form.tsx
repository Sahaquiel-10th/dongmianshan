"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ARTICLE_CATEGORIES } from "@/lib/categories";

type ArticleFormMode = "create" | "edit";

type ArticleFormValues = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string;
  coverImage: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  status: string;
  author: string;
  publishedAt: string;
};

type ArticleFormProps = {
  mode: ArticleFormMode;
  articleId?: string;
  initialValues?: ArticleFormValues;
};

const DEFAULT_VALUES: ArticleFormValues = {
  title: "",
  slug: "",
  summary: "",
  category: ARTICLE_CATEGORIES[0].slug,
  tags: "",
  coverImage: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  author: "",
  publishedAt: "",
};

export function ArticleForm({ mode, articleId, initialValues }: ArticleFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ArticleFormValues>(initialValues ?? DEFAULT_VALUES);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ArticleFormValues>(field: K, value: ArticleFormValues[K]) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(mode === "create" ? "/api/articles" : `/api/articles/${articleId}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          publishedAt: values.publishedAt || null,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "保存文章失败。");
      }

      router.push("/admin/articles");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "保存文章失败。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="cms-admin-form cms-admin-form-panel" onSubmit={handleSubmit}>
      {errorMessage ? <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p> : null}

      <div className="cms-admin-form-grid">
        <label className="cms-admin-field">
          <span>标题</span>
          <input value={values.title} onChange={(event) => updateField("title", event.target.value)} required />
        </label>

        <label className="cms-admin-field">
          <span>Slug</span>
          <input value={values.slug} onChange={(event) => updateField("slug", event.target.value)} required />
        </label>

        <label className="cms-admin-field">
          <span>分类</span>
          <select value={values.category} onChange={(event) => updateField("category", event.target.value)}>
            {ARTICLE_CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="cms-admin-field">
          <span>状态</span>
          <select value={values.status} onChange={(event) => updateField("status", event.target.value)}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>

        <label className="cms-admin-field cms-admin-field-full">
          <span>摘要</span>
          <textarea value={values.summary} onChange={(event) => updateField("summary", event.target.value)} rows={3} />
        </label>

        <label className="cms-admin-field">
          <span>标签</span>
          <input value={values.tags} onChange={(event) => updateField("tags", event.target.value)} />
        </label>

        <label className="cms-admin-field">
          <span>封面图 URL</span>
          <input value={values.coverImage} onChange={(event) => updateField("coverImage", event.target.value)} />
        </label>

        <label className="cms-admin-field">
          <span>SEO 标题</span>
          <input value={values.seoTitle} onChange={(event) => updateField("seoTitle", event.target.value)} />
        </label>

        <label className="cms-admin-field">
          <span>SEO 描述</span>
          <input
            value={values.seoDescription}
            onChange={(event) => updateField("seoDescription", event.target.value)}
          />
        </label>

        <label className="cms-admin-field">
          <span>作者</span>
          <input value={values.author} onChange={(event) => updateField("author", event.target.value)} />
        </label>

        <label className="cms-admin-field">
          <span>发布时间</span>
          <input
            type="datetime-local"
            value={values.publishedAt}
            onChange={(event) => updateField("publishedAt", event.target.value)}
          />
        </label>

        <label className="cms-admin-field cms-admin-field-full">
          <span>正文内容（Markdown）</span>
          <textarea
            value={values.content}
            onChange={(event) => updateField("content", event.target.value)}
            rows={18}
            required
          />
        </label>
      </div>

      <div className="cms-admin-form-actions">
        <button className="cms-admin-button cms-admin-button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : mode === "create" ? "创建文章" : "保存修改"}
        </button>
      </div>
    </form>
  );
}
