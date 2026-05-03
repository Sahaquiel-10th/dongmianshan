import Link from "next/link";
import { SITE_SECTION_CONFIGS } from "@/lib/site-sections";
import { prisma } from "@/lib/prisma";

export default async function AdminSectionsPage() {
  let setupError: string | null = null;
  let sections: {
    key: string;
    status: string;
    updatedAt: Date;
    items: unknown;
  }[] = [];

  try {
    sections = await prisma.siteSection.findMany({
      where: {
        key: {
          in: SITE_SECTION_CONFIGS.map((section) => section.key),
        },
      },
      select: {
        key: true,
        status: true,
        updatedAt: true,
        items: true,
      },
    });
  } catch {
    setupError = "官网板块表暂时无法读取。通常是线上数据库还没有同步 SiteSection 表，请先执行 npm run prisma:push。";
  }

  const sectionMap = new Map(sections.map((section) => [section.key, section]));

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Site Sections</p>
          <h2>官网板块管理</h2>
          <p>分栏管理首页轮播、男士护肤场景、皮肤科普、用户证言、教育、关于东面山和肌肤测试。</p>
        </div>
      </div>

      {setupError ? <p className="cms-admin-alert cms-admin-alert-error">{setupError}</p> : null}
      <div className="cms-admin-card-grid">
        {SITE_SECTION_CONFIGS.map((config) => {
          const section = sectionMap.get(config.key);
          const itemCount = Array.isArray(section?.items) ? section.items.length : 0;

          return (
            <article className="cms-admin-card" key={config.key}>
              <h3>{config.label}</h3>
              <p>{config.hint}</p>
              <p>
                {section ? `状态：${section.status === "published" ? "已发布" : "草稿"}，条目：${itemCount}` : "暂无内容，点击编辑补充。"}
              </p>
              <Link className="cms-admin-button cms-admin-button-primary" href={`/admin/sections/${config.key}`}>
                编辑板块
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
