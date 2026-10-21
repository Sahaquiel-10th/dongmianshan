import Link from "next/link";
import { SiteCopyForm } from "@/components/admin/site-copy-form";
import { getSiteCopy } from "@/lib/site-copy";
export default async function Page() {
  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Website Copy</p>
          <h2>全站文案、导航与页脚</h2>
          <p>修改官网共用文字、栏目名称、搜索提示和品牌标识。</p>
        </div>
        <Link className="cms-admin-button" href="/admin/sections">
          返回官网板块
        </Link>
      </div>
      <SiteCopyForm initialValues={await getSiteCopy()} />
    </section>
  );
}
