import { runCmsDatabaseDiagnostics } from "@/lib/db-diagnostics";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  const diagnostics = await runCmsDatabaseDiagnostics();
  const failedChecks = diagnostics.checks.filter((check) => !check.ok);

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Setup</p>
          <h2>数据库检查</h2>
          <p>检查后台内容管理依赖的 MySQL 连接、表和字段是否已同步。</p>
        </div>
      </div>

      <div className="cms-admin-setup-grid">
        <article className="cms-admin-card">
          <h3>连接目标</h3>
          <p>{diagnostics.databaseTarget}</p>
          <p>当前数据库：{diagnostics.databaseName ?? "未读取到"}</p>
          <p>连接状态：{diagnostics.canConnect ? "正常" : "失败"}</p>
        </article>

        <article className="cms-admin-card">
          <h3>同步状态</h3>
          <p>{failedChecks.length === 0 ? "表结构已满足当前后台功能。" : `还有 ${failedChecks.length} 项需要同步。`}</p>
          <p>如果检查失败，请在能访问线上数据库的部署环境执行 npm run prisma:push。</p>
        </article>
      </div>

      {diagnostics.error ? <p className="cms-admin-alert cms-admin-alert-error">{diagnostics.error}</p> : null}

      <div className="cms-admin-table-wrap">
        <table className="cms-admin-table">
          <thead>
            <tr>
              <th>检查项</th>
              <th>状态</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.checks.map((check) => (
              <tr key={check.key}>
                <td>{check.label}</td>
                <td>{check.ok ? "通过" : "未通过"}</td>
                <td>{check.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {failedChecks.length > 0 ? (
        <div className="cms-admin-command-box">
          <p>在部署平台或服务器终端执行：</p>
          <code>npm run prisma:push</code>
        </div>
      ) : null}
    </section>
  );
}
