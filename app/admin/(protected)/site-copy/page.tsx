import Link from "next/link";
import { SiteCopyForm } from "@/components/admin/site-copy-form";
import { getSiteCopy } from "@/lib/site-copy";
export default async function Page() {
  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="editor-kicker">每个页面共用的位置</p>
          <h2>导航、页脚与共用文字</h2>
          <p>这里改一次，所有使用这些文字的位置同步更新。</p>
        </div>
        <Link className="cms-admin-button" href="/admin">
          返回官网页面
        </Link>
      </div>
      <SiteCopyForm initialValues={await getSiteCopy()} />
    </section>
  );
}
