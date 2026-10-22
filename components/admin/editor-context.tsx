import Link from "next/link";
import { getSiteCopy } from "@/lib/site-copy";
import {
  editorPageHref,
  editorPageName,
  getEditorPage,
  editorPreviewHref,
} from "@/lib/editor-map";

export async function EditorContext({
  pageId,
  title,
  publicPath,
  shared,
}: {
  pageId: string;
  title: string;
  publicPath: string;
  shared?: string;
}) {
  const page = getEditorPage(pageId);
  const copy = await getSiteCopy();
  return (
    <div className="editor-context">
      <nav aria-label="后台当前位置">
        <Link href="/admin">官网页面</Link>
        <span> / </span>
        {page ? (
          <Link href={editorPageHref(page.id)}>
            {editorPageName(page, copy)}
          </Link>
        ) : null}
        <span> / {title}</span>
      </nav>
      <div className="editor-context-actions">
        <a
          className="cms-admin-button"
          href={editorPreviewHref(publicPath)}
          target="_blank"
          rel="noreferrer"
        >
          在官网定位此处 ↗
        </a>
      </div>
      {shared ? <p className="editor-shared-note">同步位置：{shared}</p> : null}
    </div>
  );
}
