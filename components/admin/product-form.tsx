"use client";
import { ImageField } from "./image-field";
import { UrlInput } from "./url-input";

import { ReferencePicker } from "./reference-picker";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductValues = {
  usage: string;
  features: string;
  ingredients: string;
  relatedArticleIds: string;
  isExample: boolean;
  name: string;
  slug: string;
  subtitle: string;
  summary: string;
  routineStep: string;
  coverImage: string;
  shopUrl: string;
  benefits: string;
  scenes: string;
  seoTitle: string;
  seoDescription: string;
  status: string;
  sortOrder: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: ProductValues;
};

const DEFAULT_VALUES: ProductValues = {
  usage: "",
  features: "",
  ingredients: "",
  relatedArticleIds: "",
  isExample: false,
  name: "",
  slug: "",
  subtitle: "",
  summary: "",
  routineStep: "",
  coverImage: "",
  shopUrl: "",
  benefits: "",
  scenes: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  sortOrder: "0",
};

export function ProductForm({
  mode,
  productId,
  initialValues,
}: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues ?? DEFAULT_VALUES);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wasSaved, setWasSaved] = useState(false);

  function updateField<K extends keyof ProductValues>(
    field: K,
    value: ProductValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
    setWasSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        mode === "create" ? "/api/products" : `/api/products/${productId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "保存产品失败。");
      }

      setHasUnsavedChanges(false);
      setWasSaved(true);
      if (mode === "create") {
        router.push("/admin/products");
      } else {
        router.refresh();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "保存产品失败。",
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
      {productId ? (
        <a
          className="cms-admin-button"
          href={`/chanpin/${values.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          查看官网对应页面
        </a>
      ) : null}
      {wasSaved ? (
        <p className="cms-admin-toast cms-admin-toast-success">
          产品已保存，发布状态下会同步显示到官网产品区。
        </p>
      ) : null}
      <p className="cms-admin-alert cms-admin-alert-info">
        本表对应官网产品卡片、详情页与官方购买页。基础介绍、使用方法、特性、原料成分、功能功效五项分别展示；购买链接在所有入口同步。
      </p>

      <div className="cms-admin-form-grid">
        <label className="cms-admin-field">
          <span>产品名称</span>
          <input
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </label>
        <label className="cms-admin-field">
          <span>产品详情的网址后缀（通常不用改）</span>
          <input
            value={values.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            required
          />
        </label>
        <label className="cms-admin-field">
          <span>产品名称上方的步骤说明</span>
          <input
            value={values.routineStep}
            onChange={(event) => updateField("routineStep", event.target.value)}
          />
        </label>
        <label className="cms-admin-field">
          <span>排序</span>
          <input
            type="number"
            value={values.sortOrder}
            onChange={(event) => updateField("sortOrder", event.target.value)}
          />
        </label>
        <label className="cms-admin-field">
          <span>状态</span>
          <select
            value={values.status}
            onChange={(event) => updateField("status", event.target.value)}
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </label>
        <label className="cms-admin-field">
          <span>购买链接</span>
          <UrlInput
            aria-label="购买链接"
            value={values.shopUrl}
            onValueChange={(value) => updateField("shopUrl", value)}
          />
        </label>
        <label className="cms-admin-field cms-admin-field-full">
          <span>产品名称下方的简短说明</span>
          <input
            value={values.subtitle}
            onChange={(event) => updateField("subtitle", event.target.value)}
          />
        </label>
        <label className="cms-admin-field cms-admin-field-full" id="product-intro">
          <span>基础介绍</span>
          <textarea
            value={values.summary}
            onChange={(event) => updateField("summary", event.target.value)}
            rows={3}
          />
        </label>
        <ImageField
          label="产品图片"
          value={values.coverImage}
          onChange={(value) => updateField("coverImage", value)}
        />
        <label className="cms-admin-field" id="product-benefits">
          <span>功能功效 / 关键词</span>
          <textarea
            value={values.benefits}
            onChange={(event) => updateField("benefits", event.target.value)}
            rows={5}
          />
        </label>
        <label className="cms-admin-field">
          <span>推荐场景</span>
          <textarea
            value={values.scenes}
            onChange={(event) => updateField("scenes", event.target.value)}
            rows={5}
          />
        </label>
        {(
          [
            ["usage", "使用方法"],
            ["features", "产品特性"],
            ["ingredients", "原料成分"],
          ] as const
        ).map(([field, label]) => (
          <label className="cms-admin-field cms-admin-field-full" key={field} id={`product-${field}`}>
            <span>{label}</span>
            <textarea
              rows={5}
              value={values[field]}
              onChange={(e) => updateField(field, e.target.value)}
            />
          </label>
        ))}
        <details className="editor-form-optional cms-admin-field-full">
          <summary>产品详情中的关联知识（可选）</summary>
          <fieldset className="cms-admin-field cms-admin-field-full">
            <legend>关联知识（人群、需求、原料、使用方法）</legend>
            <ReferencePicker
              kind="articles"
              value={values.relatedArticleIds}
              onChange={(v) => updateField("relatedArticleIds", v)}
            />
          </fieldset>
        </details>
        <label className="cms-admin-field">
          <span>示例标记</span>
          <span>
            <input
              type="checkbox"
              checked={values.isExample}
              onChange={(e) => updateField("isExample", e.target.checked)}
            />{" "}
            官网明确标注为示例（正式内容确认后取消）
          </span>
        </label>
        <label className="cms-admin-field">
          <span>搜索结果中的产品标题（可选）</span>
          <input
            value={values.seoTitle}
            onChange={(event) => updateField("seoTitle", event.target.value)}
          />
        </label>
        <label className="cms-admin-field">
          <span>搜索结果中的产品简介（可选）</span>
          <input
            value={values.seoDescription}
            onChange={(event) =>
              updateField("seoDescription", event.target.value)
            }
          />
        </label>
      </div>

      <div className="cms-admin-form-actions">
        <button
          className="cms-admin-button cms-admin-button-primary"
          type="submit"
          disabled={isSubmitting || (!hasUnsavedChanges && wasSaved)}
        >
          {isSubmitting
            ? "保存中..."
            : !hasUnsavedChanges && wasSaved
              ? "保存成功"
              : values.status === "published"
                ? "保存并更新官网"
                : "保存草稿 / 下架"}
        </button>
      </div>
    </form>
  );
}
