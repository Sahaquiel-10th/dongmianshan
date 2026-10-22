import { PageMap } from "@/components/admin/page-map";
import { ExampleImport } from "@/components/admin/example-import";
export default function AdminDashboardPage() {
  return (
    <section className="cms-admin-panel editor-overview">
      <PageMap />
      <details className="editor-maintenance">
        <summary>初次搭建：补齐缺失的示例内容</summary>
        <ExampleImport />
      </details>
    </section>
  );
}
