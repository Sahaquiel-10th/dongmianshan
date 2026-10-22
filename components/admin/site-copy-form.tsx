"use client";
import { useEffect, useState } from "react";
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
const COPY_GROUP_LOCATIONS: Record<string, string> = {
  "brand.": "每个页面左上角的品牌标识，以及搜索结果中的网站名称与简介。",
  "nav.": "每个页面顶部导航、手机菜单，以及首页四个主入口。",
  "footer.": "每个页面最底部的品牌说明和员工后台入口。",
  "common.": "产品与文章卡片上的按钮、示例内容提示。",
  "category.": "知识栏目列表、文章分类与当前位置中的名称。",
  "product.": "所有产品详情页共用的小标题和购买按钮。",
  "article.": "所有文章详情页底部的关联内容、上一篇、下一篇及作者日期标签。",
  "search.": "搜索页面的输入框、按钮和搜索结果提示。",
  "empty.": "没有已发布内容时显示的提示文字。",
  "error.": "页面不存在或加载失败时显示的文字。",
};
export function SiteCopyForm({ initialValues }: { initialValues: SiteCopy }) {
  const [values, setValues] = useState(initialValues);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    function focusGroup() {
      const element = document.getElementById(window.location.hash.slice(1));
      if (
        element instanceof HTMLDetailsElement &&
        element.classList.contains("copy-editor-group")
      ) {
        element.open = true;
        element.scrollIntoView({ block: "start" });
      }
    }
    focusGroup();
    window.addEventListener("hashchange", focusGroup);
    return () => window.removeEventListener("hashchange", focusGroup);
  }, []);
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
        以下文字由多个页面共用，修改后会一起更新。每组都标明了官网位置；页面自己的标题和图片请返回对应页面编辑。
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
          id={`copy-${group.prefix.slice(0, -1)}`}
          key={group.prefix}
          open={index < 2}
        >
          <summary>{group.label}</summary>
          <p className="editor-copy-location">
            对应官网：{COPY_GROUP_LOCATIONS[group.prefix]}
          </p>
          {group.prefix === "nav." ? (
            <div className="editor-nav-preview">
              <strong>{values["brand.name"]}</strong>
              {["nav.brand", "nav.products", "nav.care", "nav.purchase"].map(
                (key) => (
                  <span key={key}>{values[key as SiteCopyKey]}</span>
                ),
              )}
            </div>
          ) : null}
          {group.prefix === "nav." ? (
            <p className="editor-copy-location">
              产品子菜单中的名称取自产品资料：
              <a href="/admin/pages/products">编辑对应产品名称 →</a>
            </p>
          ) : null}
          {group.prefix === "footer." ? (
            <div className="editor-footer-preview">
              <strong>{values["brand.name"]}</strong>
              <span>{values["footer.text"]}</span>
              <span>{values["footer.admin"]}</span>
            </div>
          ) : null}
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
