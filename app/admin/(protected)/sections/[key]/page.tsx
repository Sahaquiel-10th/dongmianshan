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

  const stored = await prisma.siteSection.findUnique({
    where: {
      key,
    },
  });
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
          返回板块列表
        </Link>
      </div>

      <SiteSectionForm section={section} label={config.label} hint={config.hint} itemLabel={config.itemLabel} />
    </section>
  );
}
