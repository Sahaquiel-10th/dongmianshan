"use client";

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

export function SiteSectionForm({ section, label, hint, itemLabel }: SiteSectionFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateItem(index: number, field: keyof EditableItem, value: string | null) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
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
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

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

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "保存板块失败。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="cms-admin-form cms-admin-form-panel" onSubmit={handleSubmit}>
      {errorMessage ? <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p> : null}
      <p className="cms-admin-alert cms-admin-alert-info">{hint}</p>

      <div className="cms-admin-form-grid">
        <label className="cms-admin-field">
          <span>{label}标题</span>
          <input value={values.title} onChange={(event) => updateField("title", event.target.value)} required />
        </label>
        <label className="cms-admin-field">
          <span>眉标</span>
          <input value={values.eyebrow} onChange={(event) => updateField("eyebrow", event.target.value)} />
        </label>
        <label className="cms-admin-field">
          <span>状态</span>
          <select value={values.status} onChange={(event) => updateField("status", event.target.value)}>
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </label>
        <label className="cms-admin-field">
          <span>主图/视频 URL</span>
          <input value={values.mediaUrl} onChange={(event) => updateField("mediaUrl", event.target.value)} />
        </label>
        <label className="cms-admin-field cms-admin-field-full">
          <span>副标题/说明</span>
          <textarea value={values.subtitle} onChange={(event) => updateField("subtitle", event.target.value)} rows={3} />
        </label>
        <label className="cms-admin-field">
          <span>按钮文字</span>
          <input value={values.ctaLabel} onChange={(event) => updateField("ctaLabel", event.target.value)} />
        </label>
        <label className="cms-admin-field">
          <span>按钮链接</span>
          <input value={values.ctaUrl} onChange={(event) => updateField("ctaUrl", event.target.value)} />
        </label>
      </div>

      <div className="cms-admin-section-editor-head">
        <h3>{itemLabel}</h3>
        <button className="cms-admin-button" type="button" onClick={addItem}>
          新增条目
        </button>
      </div>

      <div className="cms-admin-section-items">
        {items.length === 0 ? <p className="cms-admin-alert cms-admin-alert-info">暂无条目，点击新增条目补充内容。</p> : null}
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
                  onChange={(event) => updateItem(index, "title", event.target.value)}
                  required={!item.deletedAt}
                />
              </label>
              <label className="cms-admin-field">
                <span>副标题</span>
                <input value={item.subtitle} onChange={(event) => updateItem(index, "subtitle", event.target.value)} />
              </label>
              <label className="cms-admin-field">
                <span>图片/视频 URL</span>
                <input value={item.mediaUrl} onChange={(event) => updateItem(index, "mediaUrl", event.target.value)} />
              </label>
              <label className="cms-admin-field">
                <span>标签</span>
                <input value={item.tagsText} onChange={(event) => updateItem(index, "tagsText", event.target.value)} />
              </label>
              <label className="cms-admin-field">
                <span>按钮文字</span>
                <input value={item.ctaLabel} onChange={(event) => updateItem(index, "ctaLabel", event.target.value)} />
              </label>
              <label className="cms-admin-field">
                <span>跳转链接</span>
                <input value={item.ctaUrl} onChange={(event) => updateItem(index, "ctaUrl", event.target.value)} />
              </label>
              <label className="cms-admin-field cms-admin-field-full">
                <span>正文/说明</span>
                <textarea value={item.body} onChange={(event) => updateItem(index, "body", event.target.value)} rows={3} />
              </label>
            </div>
            <div className="cms-admin-form-actions">
              {item.deletedAt ? (
                <button className="cms-admin-button cms-admin-button-primary" type="button" onClick={() => updateItem(index, "deletedAt", null)}>
                  恢复
                </button>
              ) : (
                <button
                  className="cms-admin-button cms-admin-button-danger"
                  type="button"
                  onClick={() => updateItem(index, "deletedAt", new Date().toISOString())}
                >
                  删除
                </button>
              )}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="cms-admin-form-actions">
        <button className="cms-admin-button cms-admin-button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : "保存板块"}
        </button>
      </div>
    </form>
  );
}
