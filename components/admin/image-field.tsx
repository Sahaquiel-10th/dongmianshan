"use client";
import { useId, useState } from "react";
export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="cms-admin-field cms-admin-field-full image-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="上传图片，或粘贴图片链接"
      />
      <div className="cms-admin-form-actions">
        <label className="cms-admin-button" htmlFor={`${id}-file`}>
          {busy ? "上传中…" : "上传图片"}
        </label>
        <input
          id={`${id}-file`}
          className="visually-hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={busy}
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (!file) return;
            setError("");
            if (file.size > 8 * 1024 * 1024) {
              setError("图片不能超过 8 MB。");
              input.value = "";
              return;
            }
            setBusy(true);
            try {
              const data = new FormData();
              data.set("file", file);
              const response = await fetch("/api/media", {
                method: "POST",
                body: data,
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error || "上传失败");
              onChange(result.item.url);
            } catch (e) {
              setError(e instanceof Error ? e.message : "上传失败，请重试。");
            } finally {
              setBusy(false);
              input.value = "";
            }
          }}
        />
        {value ? (
          <button
            type="button"
            className="cms-admin-button"
            onClick={() => onChange("")}
            disabled={busy}
          >
            移除图片
          </button>
        ) : null}
      </div>
      <small>
        支持 JPG、PNG、WebP、GIF，最多 8 MB。上传后还需保存当前内容；GIF
        使用首帧。
      </small>
      {busy ? <span role="status">正在上传并优化图片…</span> : null}
      {error ? (
        <p className="cms-admin-alert cms-admin-alert-error" role="alert">
          {error}
        </p>
      ) : null}
      {value ? (
        <img className="image-field-preview" src={value} alt={`${label}预览`} />
      ) : null}
    </div>
  );
}
