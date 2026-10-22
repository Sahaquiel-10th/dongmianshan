import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteCopy } from "@/lib/site-copy";
import {
  EDITOR_PAGES,
  getEditorPage,
  editorPageName,
  editorPageHref,
  editorPreviewHref,
  sectionEditorHref,
  sectionPosition,
} from "@/lib/editor-map";
import {
  getFallbackSection,
  getSectionConfig,
  toSectionContent,
} from "@/lib/site-sections";
import { sectionPreview } from "@/components/admin/page-map";
import { PageContentSource } from "@/components/admin/page-content-source";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const page = getEditorPage((await params).page);
  if (!page) notFound();
  const [copy, stored] = await Promise.all([
    getSiteCopy(),
    prisma.siteSection.findMany({ where: { key: { in: page.sections } } }),
  ]);
  const children = EDITOR_PAGES.filter((p) => p.group === page.id);
  const navChildren = children.filter((p) => p.copyKey?.startsWith("nav."));
  const extraChildren = children.filter((p) => !navChildren.includes(p));
  const childLink = (p: (typeof children)[number]) => (
    <Link key={p.id} href={editorPageHref(p.id)}>
      <span>{editorPageName(p, copy)}</span>
      <small>{p.path}</small>
      <span aria-hidden="true">→</span>
    </Link>
  );
  const name = editorPageName(page, copy);
  return (
    <section className="cms-admin-panel editor-page-panel">
      <div className="editor-welcome">
        <div>
          <p className="editor-kicker">
            <Link href="/admin">官网页面</Link> / {name}
          </p>
          <h2>{name}</h2>
          <p>按官网从上到下排列。找到画面上的文字或图片，进入对应位置编辑。</p>
        </div>
        <a
          className="cms-admin-button cms-admin-button-primary"
          href={editorPreviewHref(page.path)}
          target="_blank"
          rel="noreferrer"
        >
          打开官网并定位编辑 ↗
        </a>
      </div>
      {page.id === "home" ? (
        <div className="editor-page-outline">
          <span>
            顶部导航{" "}
            <Link href="/admin/site-copy#copy-nav">编辑共用导航 ↗</Link>
          </span>
          <span>01 海报</span>
          <span>
            四个主入口{" "}
            <Link href="/admin/site-copy#copy-nav">与导航名称同步 ↗</Link>
          </span>
          <span>02 产品区</span>
          <span>03 原料知识区</span>
          <span>
            底部页脚{" "}
            <Link href="/admin/site-copy#copy-footer">编辑共用页脚 ↗</Link>
          </span>
        </div>
      ) : null}
      <div className="editor-regions">
        {page.sections.map((key, index) => {
          const record = stored.find((s) => s.key === key);
          const section = record
            ? toSectionContent(record)
            : getFallbackSection(key);
          const preview = sectionPreview(section);
          const config = getSectionConfig(key)!;
          return (
            <section className="editor-region-card" id={key} key={key}>
              <div className="editor-region-heading">
                <span className="editor-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{sectionPosition(key)}</h3>
                  <p>
                    {section.status === "published"
                      ? "已发布"
                      : "草稿 · 官网不展示这部分内容"}
                  </p>
                </div>
              </div>
              <div className="editor-region-preview">
                {preview.image ? (
                  <img src={preview.image} alt="当前内容配图" />
                ) : null}
                <div>
                  <small>
                    {section.status === "published"
                      ? "官网当前标题"
                      : "草稿标题（官网未显示）"}
                  </small>
                  <h4>{preview.title}</h4>
                  <p>{preview.text || "暂无说明文字"}</p>
                  {key === "homepage-hero" &&
                  section.items.filter((x) => !x.deletedAt).length ? (
                    <small>
                      当前共有{" "}
                      {section.items.filter((x) => !x.deletedAt).length}{" "}
                      张海报，进入后逐张编辑
                    </small>
                  ) : null}
                </div>
              </div>
              <div className="editor-region-actions">
                <Link
                  className="cms-admin-button cms-admin-button-primary"
                  href={sectionEditorHref(key)}
                >
                  编辑这里的文案与图片
                </Link>
                <a
                  className="cms-admin-button"
                  href={editorPreviewHref(config.location)}
                  target="_blank"
                  rel="noreferrer"
                >
                  在官网查看这一处 ↗
                </a>
              </div>
              {section.items.filter((x) => !x.deletedAt).length &&
              key !== "homepage-hero" ? (
                <p className="editor-item-summary">
                  下方内容卡片：
                  {section.items
                    .filter((x) => !x.deletedAt)
                    .map((x) => x.title)
                    .join(" / ")}
                </p>
              ) : null}
              <PageContentSource sectionKey={key} pageId={page.id} />
            </section>
          );
        })}
      </div>
      {children.length ? (
        <div className="editor-child-pages">
          {navChildren.length ? (
            <>
              <h3>{name}导航下的页面</h3>
              <div>{navChildren.map(childLink)}</div>
            </>
          ) : null}
          {extraChildren.length ? (
            <details className="editor-extra-pages">
              <summary>其他已有栏目（未在顶部导航直接展示）</summary>
              <p>
                这些栏目仍可通过搜索、文章关联或直接网址访问，原有内容继续保留。
              </p>
              <div>{extraChildren.map(childLink)}</div>
            </details>
          ) : null}
        </div>
      ) : null}
      <p className="editor-shared-note">
        导航、Logo、页脚和按钮等共用文字：
        <Link href="/admin/site-copy">到全站共用位置编辑 →</Link>
      </p>
    </section>
  );
}
