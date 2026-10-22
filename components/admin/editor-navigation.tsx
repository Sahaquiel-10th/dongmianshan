"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  EDITOR_PAGES,
  editorPageHref,
  editorPageName,
  getSectionPage,
} from "@/lib/editor-map";
import type { SiteCopy } from "@/lib/site-copy-config";

export function EditorNavigation({ copy }: { copy: SiteCopy }) {
  const path = usePathname();
  const router = useRouter();
  const section = path.startsWith("/admin/sections/")
    ? getSectionPage(path.split("/").pop()!)
    : null;
  const active = section ? editorPageHref(section.id) : path;
  const options = [
    { href: "/admin", label: "所有官网页面" },
    ...EDITOR_PAGES.map((page) => ({
      href: editorPageHref(page.id),
      label: editorPageName(page, copy),
    })),
    { href: "/admin/site-copy", label: "导航、页脚与共用文字" },
  ];
  return (
    <>
      <div className="editor-mobile-picker">
        <label htmlFor="editor-page-picker">切换编辑页面</label>
        <select
          id="editor-page-picker"
          value={options.some((x) => x.href === active) ? active : ""}
          onChange={(e) => router.push(e.target.value)}
        >
          <option value="" disabled>
            选择要修改的官网页面
          </option>
          {options.map((x) => (
            <option key={x.href} value={x.href}>
              {x.label}
            </option>
          ))}
        </select>
      </div>
      <nav className="editor-navigation" aria-label="按官网页面编辑">
        <Link
          href="/admin"
          aria-current={path === "/admin" ? "page" : undefined}
        >
          选择官网页面
        </Link>
        <p>官网主页面</p>
        {EDITOR_PAGES.filter((p) => p.group === "main").map((page, i) => (
          <Link
            key={page.id}
            href={editorPageHref(page.id)}
            aria-current={
              active === editorPageHref(page.id) ? "page" : undefined
            }
          >
            <span className="editor-nav-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            {editorPageName(page, copy)}
          </Link>
        ))}
        <p>全站共用</p>
        <Link
          href="/admin/site-copy#copy-nav"
          aria-current={path === "/admin/site-copy" ? "page" : undefined}
        >
          导航、页脚与共用文字
        </Link>
        <details>
          <summary>其他官网页面</summary>
          {EDITOR_PAGES.filter((p) => p.group === "more").map((p) => (
            <Link key={p.id} href={editorPageHref(p.id)}>
              {editorPageName(p, copy)}
            </Link>
          ))}
        </details>
        <details>
          <summary>全部内容与工具</summary>
          <Link href="/admin/articles">全部文章</Link>
          <Link href="/admin/products">全部产品</Link>
          <Link href="/admin/articles/trash">文章回收站</Link>
          <Link href="/admin/setup">系统检查</Link>
        </details>
      </nav>
    </>
  );
}
