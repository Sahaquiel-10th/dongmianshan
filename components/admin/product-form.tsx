"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductValues = {
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

export function ProductForm({ mode, productId, initialValues }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues ?? DEFAULT_VALUES);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wasSaved, setWasSaved] = useState(false);

  function updateField<K extends keyof ProductValues>(field: K, value: ProductValues[K]) {
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
      const response = await fetch(mode === "create" ? "/api/products" : `/api/products/${productId}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
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
      setErrorMessage(error instanceof Error ? error.message : "保存产品失败。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="cms-admin-form cms-admin-form-panel" onSubmit={handleSubmit}>
      {errorMessage ? <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p> : null}
      <p className="cms-admin-alert cms-admin-alert-info">
        图片填写 URL，建议产品图 1200x900；简介 180 字以内；功效和场景用逗号或换行分隔，最多 8 项。
      </p>

      <div className="cms-admin-form-grid">
        <label className="cms-admin-field">
          <span>产品名称</span>
          <input value={values.name} onChange={(event) => updateField("name", event.target.value)} required />
        </label>
        <label className="cms-admin-field">
          <span>Slug</span>
          <input value={values.slug} onChange={(event) => updateField("slug", event.target.value)} required />
        </label>
        <label className="cms-admin-field">
          <span>护肤步骤</span>
          <input value={values.routineStep} onChange={(event) => updateField("routineStep", event.target.value)} />
        </label>
        <label className="cms-admin-field">
          <span>排序</span>
          <input type="number" value={values.sortOrder} onChange={(event) => updateField("sortOrder", event.target.value)} />
        </label>
        <label className="cms-admin-field">
          <span>状态</span>
          <select value={values.status} onChange={(event) => updateField("status", event.target.value)}>
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </label>
        <label className="cms-admin-field">
          <span>购买链接</span>
          <input value={values.shopUrl} onChange={(event) => updateField("shopUrl", event.target.value)} />
        </label>
        <label className="cms-admin-field cms-admin-field-full">
          <span>副标题</span>
          <input value={values.subtitle} onChange={(event) => updateField("subtitle", event.target.value)} />
        </label>
        <label className="cms-admin-field cms-admin-field-full">
          <span>简介</span>
          <textarea value={values.summary} onChange={(event) => updateField("summary", event.target.value)} rows={3} />
        </label>
        <label className="cms-admin-field cms-admin-field-full">
          <span>产品图 URL</span>
          <input value={values.coverImage} onChange={(event) => updateField("coverImage", event.target.value)} />
        </label>
        <label className="cms-admin-field">
          <span>核心功效</span>
          <textarea value={values.benefits} onChange={(event) => updateField("benefits", event.target.value)} rows={5} />
        </label>
        <label className="cms-admin-field">
          <span>推荐场景</span>
          <textarea value={values.scenes} onChange={(event) => updateField("scenes", event.target.value)} rows={5} />
        </label>
        <label className="cms-admin-field">
          <span>SEO 标题</span>
          <input value={values.seoTitle} onChange={(event) => updateField("seoTitle", event.target.value)} />
        </label>
        <label className="cms-admin-field">
          <span>SEO 描述</span>
          <input value={values.seoDescription} onChange={(event) => updateField("seoDescription", event.target.value)} />
        </label>
      </div>

      <div className="cms-admin-form-actions">
        <button
          className="cms-admin-button cms-admin-button-primary"
          type="submit"
          disabled={isSubmitting || (!hasUnsavedChanges && wasSaved)}
        >
          {isSubmitting ? "保存中..." : !hasUnsavedChanges && wasSaved ? "保存成功" : "保存产品"}
        </button>
      </div>
    </form>
  );
}
