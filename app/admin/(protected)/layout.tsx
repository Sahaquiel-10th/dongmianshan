import { isDevPreviewAuthAvailable, requireAdminUser } from "@/lib/auth";
import { getSiteCopy } from "@/lib/site-copy";
import { EditorNavigation } from "@/components/admin/editor-navigation";
export const dynamic = "force-dynamic";
export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [session, copy] = await Promise.all([
    requireAdminUser(),
    getSiteCopy(),
  ]);
  return (
    <div className="cms-admin-shell editor-shell">
      <header className="editor-header">
        <div>
          <strong>{copy["brand.name"]} · 官网编辑</strong>
          <span>{session.username}</span>
        </div>
        <div>
          <a
            href="/?edit=1"
            className="cms-admin-button"
            target="_blank"
            rel="noreferrer"
          >
            打开官网定位编辑 ↗
          </a>
          <form action="/api/auth/logout" method="post">
            <button className="cms-admin-button" type="submit">
              退出登录
            </button>
          </form>
        </div>
      </header>
      {isDevPreviewAuthAvailable() && session.username === "dev-preview" ? (
        <div className="cms-admin-preview-banner">当前为本地预览登录。</div>
      ) : null}
      <div className="editor-frame">
        <aside className="editor-sidebar">
          <EditorNavigation copy={copy} />
        </aside>
        <main className="cms-admin-content editor-main">{children}</main>
      </div>
    </div>
  );
}
