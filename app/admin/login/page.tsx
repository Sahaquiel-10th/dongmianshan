import Link from "next/link";
import { getAuthConfigError, isDevPreviewAuthAvailable, redirectIfAuthenticated } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
  }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const configError = getAuthConfigError();
  const canUseDevPreviewLogin = isDevPreviewAuthAvailable();

  if (!configError) {
    await redirectIfAuthenticated();
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = Array.isArray(resolvedSearchParams?.error)
    ? resolvedSearchParams?.error[0]
    : resolvedSearchParams?.error;

  return (
    <main className="cms-admin-screen">
      <section className="cms-admin-auth-card">
        <div className="cms-admin-auth-header">
          <p className="cms-admin-eyebrow">CMS Admin</p>
          <h1>后台登录</h1>
          <p>仅供内部内容运营人员使用。</p>
        </div>

        {configError ? <p className="cms-admin-alert cms-admin-alert-error">{configError}</p> : null}
        {canUseDevPreviewLogin ? (
          <p className="cms-admin-alert cms-admin-alert-info">
            当前是开发预览模式。你可以先用临时测试登录查看后台界面，后续配置正式环境变量后会自动切回正式登录。
          </p>
        ) : null}
        {errorMessage ? <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p> : null}

        <form className="cms-admin-form" action="/api/auth/login" method="post">
          <label className="cms-admin-field">
            <span>用户名</span>
            <input name="username" type="text" autoComplete="username" required />
          </label>

          <label className="cms-admin-field">
            <span>密码</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>

          <button
            className="cms-admin-button cms-admin-button-primary"
            type="submit"
            disabled={!!configError && !canUseDevPreviewLogin}
          >
            登录后台
          </button>
        </form>

        {canUseDevPreviewLogin ? (
          <form className="cms-admin-form" action="/api/auth/dev-login" method="post">
            <button className="cms-admin-button" type="submit">
              临时测试登录
            </button>
          </form>
        ) : null}

        <Link className="cms-admin-text-link" href="/">
          返回官网首页
        </Link>
      </section>
    </main>
  );
}
