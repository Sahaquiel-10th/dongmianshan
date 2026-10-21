"use client";
import { ImageField } from "./image-field";

import { ReferencePicker } from "./reference-picker";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { renderArticleMarkdown } from "@/lib/article-markdown";
import { ARTICLE_CATEGORIES } from "@/lib/categories";

type ArticleFormMode = "create" | "edit";

type ArticleFormValues = {
  relatedProductSlugs: string;
  isExample: boolean;
  code: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string;
  coverImage: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  relatedArticleIds: string;
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
  relatedProductSlugs: "",
  isExample: false,
  code: "",
  title: "",
  slug: "",
  summary: "",
  category: ARTICLE_CATEGORIES[0].slug,
  tags: "",
  coverImage: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  relatedArticleIds: "",
  status: "draft",
  author: "",
  publishedAt: "",
};

export function ArticleForm({
  mode,
  articleId,
  initialValues,
}: ArticleFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ArticleFormValues>(
    initialValues ?? DEFAULT_VALUES,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitIntent, setSubmitIntent] = useState<"save" | "preview">("save");
  const [lastSavedIntent, setLastSavedIntent] = useState<
    "save" | "preview" | null
  >(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const previewUrl =
    values.category &&
    values.slug &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)
      ? `/${values.category}/${values.slug}`
      : null;
  const previewHtml = renderArticleMarkdown(
    values.content || "正文预览会显示在这里。",
  );

  function updateField<K extends keyof ArticleFormValues>(
    field: K,
    value: ArticleFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
    setLastSavedIntent(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...values,
        relatedArticleIds: values.relatedArticleIds,
        status: values.status,
        publishedAt: values.publishedAt || null,
      };
      const response = await fetch(
        mode === "create" ? "/api/articles" : `/api/articles/${articleId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as {
        error?: string;
        item?: { id: string };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "保存文章失败。");
      }

      const savedArticleId = mode === "create" ? data.item?.id : articleId;
      setHasUnsavedChanges(false);
      setLastSavedIntent(submitIntent);

      if (submitIntent === "preview" && savedArticleId) {
        router.push(`/admin/articles/${savedArticleId}/preview`);
      } else if (mode === "create" && savedArticleId) {
        router.replace(`/admin/articles/${savedArticleId}/edit`);
      } else {
        router.refresh();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "保存文章失败。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="cms-admin-form cms-admin-form-panel"
      onSubmit={handleSubmit}
    >
      {errorMessage ? (
        <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p>
      ) : null}
      {!hasUnsavedChanges && lastSavedIntent === "save" ? (
        <p className="cms-admin-toast cms-admin-toast-success">
          {mode === "create" ? "草稿创建成功。" : "修改已保存。"}
        </p>
      ) : null}

      <div className="cms-admin-form-actions cms-admin-form-actions-between cms-admin-sticky-actions">
        <div className="cms-admin-form-actions">
          <button
            className="cms-admin-button"
            type="button"
            onClick={() => setIsPreviewOpen((current) => !current)}
          >
            {isPreviewOpen ? "收起当前预览" : "预览当前输入"}
          </button>
          <button
            className="cms-admin-button"
            type="submit"
            disabled={
              isSubmitting || (!hasUnsavedChanges && lastSavedIntent === "save")
            }
            onClick={() => setSubmitIntent("save")}
          >
            {isSubmitting && submitIntent === "save"
              ? "保存中..."
              : !hasUnsavedChanges && lastSavedIntent === "save"
                ? "保存成功"
                : "保存当前状态"}
          </button>
          <button
            className="cms-admin-button cms-admin-button-primary"
            type="submit"
            disabled={
              isSubmitting ||
              (!hasUnsavedChanges && lastSavedIntent === "preview")
            }
            onClick={() => setSubmitIntent("preview")}
          >
            {isSubmitting && submitIntent === "preview"
              ? "保存中..."
              : !hasUnsavedChanges && lastSavedIntent === "preview"
                ? "保存成功"
                : "保存并预览/发布"}
          </button>
        </div>
        <p className="cms-admin-inline-hint">
          当前状态：{values.status === "published" ? "已发布" : "草稿"}
          。草稿不在官网展示；选择发布后保存即可同步官网，也可先预览再发布。
        </p>
      </div>

      {isPreviewOpen ? (
        <section className="cms-admin-preview-panel">
          <div className="cms-content-article-header cms-admin-preview-header">
            <p className="cms-content-eyebrow">
              {
                ARTICLE_CATEGORIES.find((item) => item.slug === values.category)
                  ?.label
              }
            </p>
            <h1>{values.title || "文章标题预览"}</h1>
            {values.summary ? (
              <p className="cms-content-lead">{values.summary}</p>
            ) : null}
            {values.coverImage ? (
              <div className="cms-content-cover-frame">
                <img
                  src={values.coverImage}
                  alt={values.title || "文章封面预览"}
                />
              </div>
            ) : null}
          </div>
          <div
            className="cms-content-prose"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </section>
      ) : null}

      <div className="cms-admin-form-grid">
        <label className="cms-admin-field">
          <span>文章编号</span>
          <input
            value={values.code}
            onChange={(event) => updateField("code", event.target.value)}
            placeholder="留空时新建文章自动分配"
          />
        </label>

        <label className="cms-admin-field">
          <span>标题</span>
          <input
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
          />
        </label>

        <label className="cms-admin-field">
          <span>Slug</span>
          <input
            value={values.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            required
          />
        </label>

        <label className="cms-admin-field">
          <span>分类</span>
          <select
            value={values.category}
            onChange={(event) => updateField("category", event.target.value)}
          >
            {ARTICLE_CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="cms-admin-field">
          <span>发布状态</span>
          <select
            value={values.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            <option value="draft">草稿 / 下架</option>
            <option value="published">发布</option>
          </select>
        </label>

        <label className="cms-admin-field cms-admin-field-full">
          <span>摘要</span>
          <textarea
            value={values.summary}
            onChange={(event) => updateField("summary", event.target.value)}
            rows={3}
          />
        </label>

        <fieldset className="cms-admin-field cms-admin-field-full">
          <legend>关联知识（人群、需求、原料与方法）</legend>
          <ReferencePicker
            kind="articles"
            value={values.relatedArticleIds}
            onChange={(v) => updateField("relatedArticleIds", v)}
            excludeId={articleId}
          />
        </fieldset>
        <fieldset className="cms-admin-field cms-admin-field-full">
          <legend>关联产品</legend>
          <ReferencePicker
            kind="products"
            value={values.relatedProductSlugs}
            onChange={(v) => updateField("relatedProductSlugs", v)}
          />
        </fieldset>
        <label className="cms-admin-field">
          <span>示例标记</span>
          <span>
            <input
              type="checkbox"
              checked={values.isExample}
              onChange={(e) => updateField("isExample", e.target.checked)}
            />{" "}
            官网标注为示例，正式审核后可取消
          </span>
        </label>
        <label className="cms-admin-field">
          <span>标签</span>
          <input
            value={values.tags}
            onChange={(event) => updateField("tags", event.target.value)}
          />
        </label>

        <ImageField
          label="文章封面"
          value={values.coverImage}
          onChange={(value) => updateField("coverImage", value)}
        />

        <label className="cms-admin-field">
          <span>SEO 标题</span>
          <input
            value={values.seoTitle}
            onChange={(event) => updateField("seoTitle", event.target.value)}
          />
        </label>

        <label className="cms-admin-field">
          <span>SEO 描述</span>
          <input
            value={values.seoDescription}
            onChange={(event) =>
              updateField("seoDescription", event.target.value)
            }
          />
        </label>

        <label className="cms-admin-field">
          <span>作者</span>
          <input
            value={values.author}
            onChange={(event) => updateField("author", event.target.value)}
          />
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

      {previewUrl ? (
        <a
          className="cms-admin-button"
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
        >
          打开前台页面
        </a>
      ) : null}
    </form>
  );
}
