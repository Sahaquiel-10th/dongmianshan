"use client";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { editorPageFromPath, editorPageHref } from "@/lib/editor-map";

const EditorMode = createContext(false);
export function SiteEditorTools({
  allowed,
  children,
}: {
  allowed: boolean;
  children: ReactNode;
}) {
  const [enabled, setEnabled] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    if (
      allowed &&
      new URL(window.location.href).searchParams.get("edit") === "1"
    )
      setEnabled(true);
  }, [allowed, pathname]);
  const page = editorPageFromPath(pathname);
  return (
    <EditorMode.Provider value={allowed && enabled}>
      {allowed ? (
        <div className="cms-editor-bar" role="region" aria-label="官网编辑工具">
          <span>员工视图</span>
          <button
            type="button"
            aria-pressed={enabled}
            onClick={() => {
              const next = !enabled;
              setEnabled(next);
              const url = new URL(window.location.href);
              if (next) url.searchParams.set("edit", "1");
              else url.searchParams.delete("edit");
              window.history.replaceState(
                null,
                "",
                `${url.pathname}${url.search}${url.hash}`,
              );
            }}
          >
            {enabled ? "预览访客效果" : "显示编辑按钮"}
          </button>
          <Link href={page ? editorPageHref(page.id) : "/admin"}>编辑此页</Link>
          <Link href="/admin/site-copy#copy-nav">导航</Link>
          <Link href="/admin/site-copy#copy-footer">页脚</Link>
          <Link href="/admin">后台首页</Link>
        </div>
      ) : null}
      {children}
    </EditorMode.Provider>
  );
}
export function EditMarker({ href, label }: { href: string; label: string }) {
  const enabled = useContext(EditorMode);
  const path = usePathname();
  const page = editorPageFromPath(path);
  let target = href;
  if (page && /^\/admin\/(products|articles|sections)\//.test(href)) {
    const url = new URL(href, "https://editor.invalid");
    if (!url.searchParams.has("from")) url.searchParams.set("from", page.id);
    url.searchParams.set("returnTo", path);
    target = `${url.pathname}${url.search}${url.hash}`;
  }
  return enabled ? (
    <span className="cms-edit-marker">
      <Link href={target} aria-label={`编辑：${label}`} title={label}>编辑此处 ↗</Link>
    </span>
  ) : null;
}

// These controls are rendered only after the server has verified the staff session.
// Every mutation also passes the existing API authentication check.
export function ArticleActions({
  article,
}: {
  article: { id: string; title: string; category: string; slug: string };
}) {
  const enabled = useContext(EditorMode);
  const path = usePathname();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const page = editorPageFromPath(path);
  const query = new URLSearchParams({ returnTo: path });
  if (page) query.set("from", page.id);

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/articles/${encodeURIComponent(article.id)}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "删除失败，请重试。");
      }
      dialog.current?.close();
      if (path === `/${article.category}/${article.slug}`) {
        // Leave the removed detail page before requesting its content again.
        window.location.assign(`/${article.category}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "删除失败，请重试。");
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) return null;
  return (
    <div className="cms-inline-actions" role="group" aria-label={`管理文章：${article.title}`}>
      <Link className="cms-edit-control" href={`/admin/articles/${article.id}/edit?${query}`}>编辑文章 ↗</Link>
      <button className="cms-edit-control cms-edit-control-delete" type="button" onClick={() => {
        setError("");
        dialog.current?.showModal();
      }}>删除文章</button>
      <dialog className="cms-delete-dialog" ref={dialog} aria-labelledby={headingId} aria-describedby={descriptionId} onCancel={(event) => {
        if (busy) event.preventDefault();
      }}>
        <h2 id={headingId}>删除这篇文章？</h2>
        <p className="cms-delete-title">{article.title}</p>
        <p id={descriptionId}>删除后将从官网所有位置下架，可在后台回收站中于 15 天内恢复。</p>
        {error ? <p className="cms-delete-error" role="alert">{error}</p> : null}
        <div className="cms-delete-dialog-actions">
          <button className="cms-edit-control" type="button" autoFocus disabled={busy} onClick={() => dialog.current?.close()}>取消</button>
          <button className="cms-edit-control cms-edit-control-delete" type="button" disabled={busy} onClick={remove}>{busy ? "删除中…" : "确认删除"}</button>
        </div>
      </dialog>
    </div>
  );
}

export function CreateArticleCard({ category, label }: { category: string; label: string }) {
  const enabled = useContext(EditorMode);
  const path = usePathname();
  const query = new URLSearchParams({ category, returnTo: path });
  return enabled ? (
    <Link className="cms-create-card" href={`/admin/articles/new?${query}`}>
      <span className="cms-create-symbol" aria-hidden="true">＋</span>
      <strong>新增文章</strong>
      <span>添加到「{label}」栏目</span>
    </Link>
  ) : null;
}
export function EditableCard({
  href,
  label,
  children,
  article,
}: {
  href: string;
  label: string;
  children: ReactNode;
  article?: { id: string; title: string; category: string; slug: string };
}) {
  const enabled = useContext(EditorMode);
  return enabled ? (
    <div className="cms-edit-card">
      {children}
      {article ? <ArticleActions article={article} /> : <EditMarker href={href} label={label} />}
    </div>
  ) : (
    <>{children}</>
  );
}
