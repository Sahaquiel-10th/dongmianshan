"use client";
import { ImageField } from "./image-field";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SiteSectionContent } from "@/lib/site-sections";

type EditableItem = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  mediaUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  tagsText: string;
  deletedAt: string | null;
};

type SiteSectionFormProps = {
  section: SiteSectionContent;
  label: string;
  hint: string;
  itemLabel: string;
};

function toEditableItems(section: SiteSectionContent): EditableItem[] {
  return section.items.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? "",
    body: item.body ?? "",
    mediaUrl: item.mediaUrl ?? "",
    ctaLabel: item.ctaLabel ?? "",
    ctaUrl: item.ctaUrl ?? "",
    tagsText: item.tags?.join("，") ?? "",
    deletedAt: item.deletedAt ?? null,
  }));
}

export function SiteSectionForm({
  section,
  label,
  hint,
  itemLabel,
}: SiteSectionFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    tagsText: section.tags?.join("，") ?? "",
    title: section.title,
    eyebrow: section.eyebrow ?? "",
    subtitle: section.subtitle ?? "",
    body: section.body ?? "",
    mediaUrl: section.mediaUrl ?? "",
    ctaLabel: section.ctaLabel ?? "",
    ctaUrl: section.ctaUrl ?? "",
    status: section.status,
    sortOrder: "0",
  });
  const [items, setItems] = useState<EditableItem[]>(toEditableItems(section));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wasSaved, setWasSaved] = useState(false);

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setHasUnsavedChanges(true);
    setWasSaved(false);
    setSuccessMessage(null);
  }

  function updateItem(
    index: number,
    field: keyof EditableItem,
    value: string | null,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
    setHasUnsavedChanges(true);
    setWasSaved(false);
    setSuccessMessage(null);
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: "",
        subtitle: "",
        body: "",
        mediaUrl: "",
        ctaLabel: "",
        ctaUrl: "",
        tagsText: "",
        deletedAt: null,
      },
    ]);
    setHasUnsavedChanges(true);
    setWasSaved(false);
    setSuccessMessage(null);
  }

  function moveItem(index: number, offset: number) {
    setItems((current) => {
      const next = [...current];
      const target = index + offset;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setHasUnsavedChanges(true);
    setWasSaved(false);
    setSuccessMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/site-sections/${section.key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          items,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "保存板块失败。");
      }

      setSuccessMessage("已保存。前台页面会读取最新发布内容。");
      setHasUnsavedChanges(false);
      setWasSaved(true);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "保存板块失败。",
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
      {successMessage ? (
        <p className="cms-admin-alert cms-admin-alert-success">
          {successMessage}
        </p>
      ) : null}
      <p className="cms-admin-alert cms-admin-alert-info">{hint}</p>

      <div className="cms-admin-form-grid">
        <label className="cms-admin-field cms-admin-field-full">
          <span>页面标签（逗号或换行分隔）</span>
          <textarea
            value={values.tagsText}
            onChange={(e) => updateField("tagsText", e.target.value)}
            rows={2}
          />
        </label>
        <label className="cms-admin-field">
          <span>{label}标题</span>
          <input
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
          />
        </label>
        <label className="cms-admin-field">
          <span>眉标</span>
          <input
            value={values.eyebrow}
            onChange={(event) => updateField("eyebrow", event.target.value)}
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
        <ImageField
          label="板块主图"
          value={values.mediaUrl}
          onChange={(value) => updateField("mediaUrl", value)}
        />
        <label className="cms-admin-field cms-admin-field-full">
          <span>副标题/说明</span>
          <textarea
            value={values.subtitle}
            onChange={(event) => updateField("subtitle", event.target.value)}
            rows={3}
          />
        </label>
        <label className="cms-admin-field cms-admin-field-full">
          <span>正文说明</span>
          <textarea
            value={values.body}
            onChange={(e) => updateField("body", e.target.value)}
            rows={5}
          />
        </label>
        <label className="cms-admin-field">
          <span>按钮文字</span>
          <input
            value={values.ctaLabel}
            onChange={(event) => updateField("ctaLabel", event.target.value)}
          />
        </label>
        <label className="cms-admin-field">
          <span>按钮链接</span>
          <input
            value={values.ctaUrl}
            onChange={(event) => updateField("ctaUrl", event.target.value)}
          />
        </label>
      </div>

      <div className="cms-admin-section-editor-head">
        <h3>{itemLabel}</h3>
        <button className="cms-admin-button" type="button" onClick={addItem}>
          新增条目
        </button>
      </div>

      <div className="cms-admin-section-items">
        {items.length === 0 ? (
          <p className="cms-admin-alert cms-admin-alert-info">
            暂无条目，点击新增条目补充内容。
          </p>
        ) : null}
        {items.map((item, index) => (
          <fieldset className="cms-admin-item-editor" key={item.id}>
            <legend>
              {item.deletedAt ? "已删除条目" : `${itemLabel} ${index + 1}`}
            </legend>
            <div className="cms-admin-form-grid">
              <label className="cms-admin-field">
                <span>标题</span>
                <input
                  value={item.title}
                  onChange={(event) =>
                    updateItem(index, "title", event.target.value)
                  }
                  required={!item.deletedAt}
                />
              </label>
              <label className="cms-admin-field">
                <span>副标题</span>
                <input
                  value={item.subtitle}
                  onChange={(event) =>
                    updateItem(index, "subtitle", event.target.value)
                  }
                />
              </label>
              <ImageField
                label="条目图片"
                value={item.mediaUrl}
                onChange={(value) => updateItem(index, "mediaUrl", value)}
              />
              <label className="cms-admin-field">
                <span>标签</span>
                <input
                  value={item.tagsText}
                  onChange={(event) =>
                    updateItem(index, "tagsText", event.target.value)
                  }
                />
              </label>
              <label className="cms-admin-field">
                <span>按钮文字</span>
                <input
                  value={item.ctaLabel}
                  onChange={(event) =>
                    updateItem(index, "ctaLabel", event.target.value)
                  }
                />
              </label>
              <label className="cms-admin-field">
                <span>跳转链接</span>
                <input
                  value={item.ctaUrl}
                  onChange={(event) =>
                    updateItem(index, "ctaUrl", event.target.value)
                  }
                />
              </label>
              <label className="cms-admin-field cms-admin-field-full">
                <span>正文/说明</span>
                <textarea
                  value={item.body}
                  onChange={(event) =>
                    updateItem(index, "body", event.target.value)
                  }
                  rows={3}
                />
              </label>
            </div>
            <div className="cms-admin-form-actions">
              <button
                className="cms-admin-button"
                type="button"
                disabled={index === 0}
                onClick={() => moveItem(index, -1)}
              >
                上移
              </button>
              <button
                className="cms-admin-button"
                type="button"
                disabled={index === items.length - 1}
                onClick={() => moveItem(index, 1)}
              >
                下移
              </button>
              {item.deletedAt ? (
                <button
                  className="cms-admin-button cms-admin-button-primary"
                  type="button"
                  onClick={() => updateItem(index, "deletedAt", null)}
                >
                  恢复
                </button>
              ) : (
                <button
                  className="cms-admin-button cms-admin-button-danger"
                  type="button"
                  onClick={() =>
                    updateItem(index, "deletedAt", new Date().toISOString())
                  }
                >
                  删除
                </button>
              )}
            </div>
          </fieldset>
        ))}
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
              : "保存板块"}
        </button>
      </div>
    </form>
  );
}
