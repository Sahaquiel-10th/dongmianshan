import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteCopy } from "@/lib/site-copy";
import { EDITOR_PAGES, editorPageName, editorPageHref } from "@/lib/editor-map";
import {
  getFallbackSection,
  toSectionContent,
  type SiteSectionContent,
} from "@/lib/site-sections";

export function sectionPreview(section: SiteSectionContent) {
  const first =
    section.key === "homepage-hero"
      ? section.items.find((x) => !x.deletedAt)
      : undefined;
  return first
    ? { title: first.title, image: first.mediaUrl, text: first.body }
    : { title: section.title, image: section.mediaUrl, text: section.subtitle };
}
export async function PageMap() {
  const [copy, sections] = await Promise.all([
    getSiteCopy(),
    prisma.siteSection.findMany(),
  ]);
  return (
    <>
      <div className="editor-welcome">
        <div>
          <p className="editor-kicker">从官网画面开始</p>
          <h2>你要修改哪个页面？</h2>
          <p>页面名称与官网导航一致。进入后，按画面从上到下找到要改的内容。</p>
        </div>
        <a
          className="cms-admin-button cms-admin-button-primary"
          href="/?edit=1"
          target="_blank"
          rel="noreferrer"
        >
          直接在官网找内容 ↗
        </a>
      </div>
      <div className="editor-page-grid">
        {EDITOR_PAGES.filter((p) => p.group === "main").map((page, i) => {
          const stored = sections.find((s) => s.key === page.sections[0]);
          const content = stored
            ? toSectionContent(stored)
            : getFallbackSection(page.sections[0]);
          const preview = sectionPreview(content);
          return (
            <Link
              className="editor-page-card"
              href={editorPageHref(page.id)}
              key={page.id}
            >
              <div className="editor-page-card-top">
                <span className="editor-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{page.path}</span>
              </div>
              <h3>
                {editorPageName(page, copy)} <span aria-hidden="true">→</span>
              </h3>
              <div className="editor-page-preview">
                {preview.image ? <img src={preview.image} alt="" /> : null}
                <div>
                  <small>
                    {content.status === "published"
                      ? "官网当前标题"
                      : "草稿标题（官网未显示）"}
                  </small>
                  <strong>{preview.title}</strong>
                </div>
              </div>
              <span className="editor-card-foot">
                {page.sections.length === 1
                  ? "查看此页内容"
                  : `${page.sections.length} 个区域，按官网顺序编辑`}
                {content.status === "draft" ? " · 当前内容已下架" : ""}
              </span>
            </Link>
          );
        })}
        <Link
          className="editor-page-card editor-shared-card"
          href="/admin/site-copy#copy-nav"
        >
          <div className="editor-page-card-top">
            <span className="editor-number">全站</span>
            <span>每个页面共用</span>
          </div>
          <h3>导航、页脚与共用文字 →</h3>
          <p>
            Logo、导航名称、页脚说明和按钮文字。在这里改一次，使用它的页面同步更新。
          </p>
          <span className="editor-card-foot">页面正文在各自页面中编辑</span>
        </Link>
      </div>
      <div className="editor-other-pages">
        <h3>官网其他页面</h3>
        {EDITOR_PAGES.filter((p) => p.group === "more").map((p) => (
          <Link
            className="cms-admin-button"
            key={p.id}
            href={editorPageHref(p.id)}
          >
            {editorPageName(p, copy)} →
          </Link>
        ))}
      </div>
    </>
  );
}
