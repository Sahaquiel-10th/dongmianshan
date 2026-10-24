"use client";
import { ImageField } from "./image-field";
import { UrlInput } from "./url-input";

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

export function SiteSectionForm({ section, itemLabel }: SiteSectionFormProps) {
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
  const isHero = section.key === "homepage-hero";
  const usesSlides = isHero && items.some((item) => !item.deletedAt);

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
      ...(isHero &&
      !current.some((x) => !x.deletedAt) &&
      values.status === "published"
        ? [
            {
              id: crypto.randomUUID(),
              title: values.title,
              subtitle: values.eyebrow,
              body: values.subtitle,
              mediaUrl: values.mediaUrl,
              ctaLabel: values.ctaLabel,
              ctaUrl: values.ctaUrl,
              tagsText: "",
              deletedAt: null,
            },
          ]
        : []),
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
      {usesSlides ? (
        <p className="editor-source-shortcut">
          官网当前使用下方的海报列表。请直接修改每张海报的标题、背景图和按钮；这里的共同设置会用于所有海报。
        </p>
      ) : null}

      <div className="cms-admin-form-grid">
        <label className="cms-admin-field cms-admin-field-full">
          <span>
            {isHero ? "海报共用标签" : "标题附近的标签"}（逗号或换行分隔）
          </span>
          <textarea
            value={values.tagsText}
            onChange={(e) => updateField("tagsText", e.target.value)}
            rows={2}
          />
        </label>
        {!usesSlides ? (
          <>
            <label className="cms-admin-field">
              <span>{isHero ? "海报大标题" : "页面或区域的大标题"}</span>
              <input
                value={values.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
              />
            </label>
            <label className="cms-admin-field">
              <span>大标题上方的小字</span>
              <input
                value={values.eyebrow}
                onChange={(event) => updateField("eyebrow", event.target.value)}
              />
            </label>
          </>
        ) : null}
        <label className="cms-admin-field">
          <span>官网展示状态</span>
          <select
            value={values.status}
            onChange={(event) => updateField("status", event.target.value)}
          >
            <option value="draft">草稿 / 下架</option>
            <option value="published">发布 / 官网展示</option>
          </select>
        </label>
        {!usesSlides ? (
          <>
            <ImageField
              label={isHero ? "海报背景图" : "标题区域的配图"}
              value={values.mediaUrl}
              onChange={(value) => updateField("mediaUrl", value)}
            />
            <label className="cms-admin-field cms-admin-field-full">
              <span>大标题下方的说明</span>
              <textarea
                value={values.subtitle}
                onChange={(event) =>
                  updateField("subtitle", event.target.value)
                }
                rows={3}
              />
            </label>
          </>
        ) : null}
        <label className="cms-admin-field cms-admin-field-full">
          <span>
            {isHero ? "海报下方补充文字（所有海报共用）" : "说明下方的补充正文"}
          </span>
          <textarea
            value={values.body}
            onChange={(e) => updateField("body", e.target.value)}
            rows={5}
          />
        </label>
        {!usesSlides ? (
          <>
            <label className="cms-admin-field">
              <span>{isHero ? "海报按钮文字" : "标题区域的按钮文字"}</span>
              <input
                value={values.ctaLabel}
                onChange={(event) =>
                  updateField("ctaLabel", event.target.value)
                }
              />
            </label>
            <label className="cms-admin-field">
              <span>这个按钮打开的网址</span>
              <UrlInput
                aria-label="这个按钮打开的网址"
                value={values.ctaUrl}
                onValueChange={(value) => updateField("ctaUrl", value)}
              />
            </label>
          </>
        ) : null}
      </div>

      <div className="cms-admin-section-editor-head">
        <h3>{isHero ? "逐张编辑首页海报" : `下方的${itemLabel}卡片`}</h3>
        <button className="cms-admin-button" type="button" onClick={addItem}>
          {isHero ? "新增一张海报" : "新增一张卡片"}
        </button>
      </div>

      <div className="cms-admin-section-items">
        {items.length === 0 ? (
          <p className="cms-admin-alert cms-admin-alert-info">
            {isHero
              ? "当前使用上方的单张海报设置；如需多张海报，可在这里新增。"
              : "这里没有额外卡片。新增后会出现在页面标题区域下方。"}
          </p>
        ) : null}
        {items.map((item, index) => (
          <fieldset
            className="cms-admin-item-editor"
            id={`item-${item.id}`}
            key={item.id}
          >
            <legend>
              {item.deletedAt
                ? "已删除，可恢复"
                : `${isHero ? "第" : "卡片 "}${items.slice(0, index).filter((x) => !x.deletedAt).length + 1}${isHero ? " 张海报" : ""}`}
              {item.title ? ` · ${item.title}` : " · 尚未填写标题"}
            </legend>
            <fieldset className="cms-admin-form-grid cms-admin-item-fields" disabled={!!item.deletedAt} aria-label="条目内容">
              <label className="cms-admin-field">
                <span>{isHero ? "海报大标题" : "卡片标题"}</span>
                <input
                  value={item.title}
                  onChange={(event) =>
                    updateItem(index, "title", event.target.value)
                  }
                  required={!item.deletedAt}
                />
              </label>
              <label className="cms-admin-field">
                <span>
                  {isHero ? "大标题上方的小字" : "卡片标题下方的说明"}
                </span>
                <input
                  value={item.subtitle}
                  onChange={(event) =>
                    updateItem(index, "subtitle", event.target.value)
                  }
                />
              </label>
              <ImageField
                label={isHero ? "海报背景图" : "这张卡片的图片"}
                value={item.mediaUrl}
                onChange={(value) => updateItem(index, "mediaUrl", value)}
              />
              <label className="cms-admin-field">
                <span>这张{isHero ? "海报" : "卡片"}的标签</span>
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
                <span>这个按钮打开的网址</span>
                <UrlInput
                  aria-label="这个按钮打开的网址"
                  value={item.ctaUrl}
                  onValueChange={(value) => updateItem(index, "ctaUrl", value)}
                />
              </label>
              <label className="cms-admin-field cms-admin-field-full">
                <span>{isHero ? "大标题下方的说明" : "卡片正文"}</span>
                <textarea
                  value={item.body}
                  onChange={(event) =>
                    updateItem(index, "body", event.target.value)
                  }
                  rows={3}
                />
              </label>
            </fieldset>
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
                  onClick={() => {
                    if (
                      isHero &&
                      items.filter((x) => !x.deletedAt).length === 1
                    )
                      updateField("status", "draft");
                    if (!item.title.trim()) {
                      setItems((current) =>
                        current.filter((x) => x.id !== item.id),
                      );
                      setHasUnsavedChanges(true);
                      setWasSaved(false);
                    } else
                      updateItem(index, "deletedAt", new Date().toISOString());
                  }}
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
              : values.status === "published"
                ? "保存并更新官网"
                : "保存为草稿 / 下架"}
        </button>
        <span className="editor-save-note">
          {values.status === "published"
            ? "保存后官网立即读取新内容"
            : "保存草稿会隐藏这部分官网内容"}
        </span>
      </div>
    </form>
  );
}
