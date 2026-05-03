import Link from "next/link";
import { isDevPreviewAuthAvailable, requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminUser();
  const isDevPreview = isDevPreviewAuthAvailable() && session.username === "dev-preview";

  return (
    <div className="cms-admin-shell">
      <header className="cms-admin-header">
        <div>
          <p className="cms-admin-eyebrow">Content Management</p>
          <h1 className="cms-admin-header-title">内容管理后台</h1>
          <p className="cms-admin-header-subtitle">{session.username ? `当前登录：${session.username}` : "已登录"}</p>
        </div>

        <nav className="cms-admin-nav">
          <Link className="cms-admin-button" href="/admin">
            后台首页
          </Link>
          <Link className="cms-admin-button" href="/admin/articles">
            文章管理
          </Link>
          <Link className="cms-admin-button" href="/admin/products">
            产品一览
          </Link>
          <Link className="cms-admin-button" href="/admin/sections">
            官网板块
          </Link>
          <Link className="cms-admin-button cms-admin-button-primary" href="/admin/articles/new">
            新建文章
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="cms-admin-button" type="submit">
              退出登录
            </button>
          </form>
        </nav>
      </header>

      {isDevPreview ? (
        <div className="cms-admin-preview-banner">
          当前是临时测试登录模式，仅用于预览后台界面。接入正式 MySQL 和后台账号后会自动切回正式模式。
        </div>
      ) : null}

      <div className="cms-admin-content">{children}</div>
    </div>
  );
}
