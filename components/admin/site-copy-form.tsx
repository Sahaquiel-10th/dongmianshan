"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  COPY_GROUPS,
  COPY_FIELD_LABELS,
  DEFAULT_SITE_COPY,
  SITE_COPY_KEYS,
  type SiteCopy,
  type SiteCopyKey,
} from "@/lib/site-copy-config";
import { ImageField } from "./image-field";
export function SiteCopyForm({ initialValues }: { initialValues: SiteCopy }) {
  const [values, setValues] = useState(initialValues);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  function change(key: SiteCopyKey, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setMessage("");
  }
  return (
    <form
      className="cms-admin-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
          const r = await fetch("/api/site-copy", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ values }),
          });
          const data = await r.json();
          if (!r.ok) throw new Error(data.error);
          setMessage("已发布，官网各页面会读取新文案。");
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "保存失败");
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="cms-admin-alert cms-admin-alert-info">
        这里管理全站共用文字和固定栏目名称；各页面的标题、说明、图片、标签请在对应页面或内容编辑。保存后直接发布，网址与页面布局保持不变。
      </p>
      {error ? (
        <p role="alert" className="cms-admin-alert cms-admin-alert-error">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="cms-admin-alert cms-admin-alert-success">
          {message}
        </p>
      ) : null}
      <div className="cms-admin-sticky-actions">
        <button
          className="cms-admin-button cms-admin-button-primary"
          type="submit"
          disabled={busy}
        >
          {busy ? "发布中…" : "保存并发布全站文案"}
        </button>
      </div>
      {COPY_GROUPS.map((group, index) => (
        <details
          className="copy-editor-group"
          key={group.prefix}
          open={index < 2}
        >
          <summary>{group.label}</summary>
          <div className="cms-admin-form-grid">
            {SITE_COPY_KEYS.filter((key) => key.startsWith(group.prefix)).map(
              (key) =>
                key === "brand.logo" ? (
                  <ImageField
                    key={key}
                    label={COPY_FIELD_LABELS[key]!}
                    value={values[key]}
                    onChange={(value) => change(key, value)}
                  />
                ) : (
                  <label className="cms-admin-field" key={key}>
                    <span>
                      {COPY_FIELD_LABELS[key] || DEFAULT_SITE_COPY[key]}
                    </span>
                    <textarea
                      rows={values[key].length > 40 ? 3 : 1}
                      value={values[key]}
                      onChange={(event) => change(key, event.target.value)}
                      maxLength={1000}
                    />
                  </label>
                ),
            )}
          </div>
        </details>
      ))}
      <button
        className="cms-admin-button cms-admin-button-primary"
        type="submit"
        disabled={busy}
      >
        {busy ? "发布中…" : "保存并发布全站文案"}
      </button>
    </form>
  );
}
