import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteSectionForm } from "@/components/admin/site-section-form";
import { getFallbackSection, getSectionConfig, toSectionContent } from "@/lib/site-sections";
import { prisma } from "@/lib/prisma";

type AdminSectionPageProps = {
  params: Promise<{
    key: string;
  }>;
};

export default async function AdminSectionPage({ params }: AdminSectionPageProps) {
  const { key } = await params;
  const config = getSectionConfig(key);

  if (!config) {
    notFound();
  }

  let setupError: string | null = null;
  let stored: Awaited<ReturnType<typeof prisma.siteSection.findUnique>> = null;

  try {
    stored = await prisma.siteSection.findUnique({
      where: {
        key,
      },
    });
  } catch {
    setupError = "官网板块表暂时无法读取。可以先查看默认表单结构；保存前需要先在部署环境执行 npm run prisma:push。";
  }

  const section = stored ? toSectionContent(stored) : getFallbackSection(config.key);

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Site Sections</p>
          <h2>{config.label}</h2>
          <p>{config.hint}</p>
        </div>
        <Link className="cms-admin-button" href="/admin/sections">
          返回上一级页面
        </Link>
      </div>

      {setupError ? (
        <p className="cms-admin-alert cms-admin-alert-error">
          {setupError} <Link href="/admin/setup">查看数据库检查</Link>
        </p>
      ) : null}
      <SiteSectionForm section={section} label={config.label} hint={config.hint} itemLabel={config.itemLabel} />
    </section>
  );
}
