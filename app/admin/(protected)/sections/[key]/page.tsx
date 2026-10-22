import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteSectionForm } from "@/components/admin/site-section-form";
import {
  getFallbackSection,
  getSectionConfig,
  toSectionContent,
} from "@/lib/site-sections";
import { prisma } from "@/lib/prisma";
import { EditorContext } from "@/components/admin/editor-context";
import {
  editorPageHref,
  getSectionPage,
  sectionPosition,
  sectionSources,
  editorPublicReturnPath,
} from "@/lib/editor-map";

type AdminSectionPageProps = {
  params: Promise<{
    key: string;
  }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function AdminSectionPage({
  params,
  searchParams,
}: AdminSectionPageProps) {
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
    setupError =
      "官网板块表暂时无法读取。可以先查看默认表单结构；保存前需要先在部署环境执行 npm run prisma:push。";
  }

  const section = stored
    ? toSectionContent(stored)
    : getFallbackSection(config.key);
  const page = getSectionPage(key)!;
  const source = sectionSources(key);
  const query = await searchParams;
  const returnTo = query.returnTo ? editorPublicReturnPath(query.returnTo, page.path) : undefined;

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="editor-kicker">修改官网画面</p>
          <h2>{sectionPosition(key)}</h2>
          <p>修改下面的对应字段，保存后查看官网效果。</p>
        </div>
        <Link className="cms-admin-button" href={returnTo ?? editorPageHref(page.id)}>
          {returnTo ? "返回官网原位置" : "返回这个页面的全部内容"}
        </Link>
      </div>

      {setupError ? (
        <p className="cms-admin-alert cms-admin-alert-error">
          {setupError} <Link href="/admin/setup">查看数据库检查</Link>
        </p>
      ) : null}
      <EditorContext
        pageId={page.id}
        title={sectionPosition(key)}
        publicPath={returnTo ?? config.location}
      />
      {source ? (
        <p className="editor-source-shortcut">
          这里编辑区域标题与说明。{source.label}来自对应的
          {source.kind === "products" ? "产品" : "文章"}资料：
          <Link href={`${editorPageHref(page.id)}#source-${key}`}>
            编辑{source.label} →
          </Link>
        </p>
      ) : null}
      <SiteSectionForm section={section} itemLabel={config.itemLabel} />
    </section>
  );
}
