import { getSiteCopy } from "@/lib/site-copy";
import { categoryCopy } from "@/lib/site-copy-config";
import Link from "next/link";
import type { SiteSectionContent } from "@/lib/site-sections";
import type { Article } from "@prisma/client";
import type { SiteProduct } from "@/lib/products";
import { articleHref } from "@/lib/knowledge";
import { EditMarker, EditableCard } from "./editor-tools";
export async function ExampleNote() {
  const copy = await getSiteCopy();
  return <p className="example-note">{copy["common.exampleNote"]}</p>;
}
export function SectionIntro({ section }: { section: SiteSectionContent }) {
  return (
    <>
      {section.mediaUrl ? (
        <img
          className="section-lead-image"
          src={section.mediaUrl}
          alt={section.title}
        />
      ) : null}
      <p className="site-eyebrow">{section.eyebrow}</p>
      <h1>{section.title}</h1>
      <SectionTags section={section} />
      {section.subtitle ? <p>{section.subtitle}</p> : null}
      {section.body ? <p className="preserve-lines">{section.body}</p> : null}
      <EditMarker
        href={`/admin/sections/${section.key}`}
        label={section.title}
      />
    </>
  );
}
export async function SectionLink({
  section,
}: {
  section: SiteSectionContent;
}) {
  const copy = await getSiteCopy();
  return section.ctaUrl ? (
    <Link className="site-text-link" href={section.ctaUrl}>
      {section.ctaLabel || copy["common.more"]} →
    </Link>
  ) : null;
}
export async function SectionItems({
  section,
}: {
  section: SiteSectionContent;
}) {
  const copy = await getSiteCopy();
  return (
    <>
      {section.items.map((item) => (
        <article className="education-card" id={item.id} key={item.id}>
          {item.mediaUrl ? (
            <img
              className="section-item-image"
              src={item.mediaUrl}
              alt={item.title}
            />
          ) : null}
          <h2>{item.title}</h2>
          {item.subtitle ? <p>{item.subtitle}</p> : null}
          {item.body ? <p className="preserve-lines">{item.body}</p> : null}
          {item.tags?.length ? (
            <div className="scene-grid">
              {item.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
          {item.ctaUrl ? (
            <Link className="site-text-link" href={item.ctaUrl}>
              {item.ctaLabel || copy["common.continue"]} →
            </Link>
          ) : null}
          <EditMarker
            href={`/admin/sections/${section.key}#item-${item.id}`}
            label={item.title}
          />
        </article>
      ))}
    </>
  );
}
export async function KnowledgeCards({
  articles,
}: {
  articles: Pick<
    Article,
    "id" | "category" | "slug" | "title" | "summary" | "isExample"
  >[];
}) {
  const copy = await getSiteCopy();
  return (
    <div className="education-grid">
      {articles.map((a) => (
        <EditableCard
          href={`/admin/articles/${a.id}/edit`}
          label={a.title}
          key={a.id}
          article={a}
        >
          <Link
            className="education-card knowledge-card"
            key={a.id}
            href={articleHref(a)}
          >
            <span>
              {categoryCopy(copy, a.category)}
              {a.isExample ? ` · ${copy["common.example"]}` : ""}
            </span>
            <h3>{a.title}</h3>
            {a.summary ? <p>{a.summary}</p> : null}
            <span className="site-text-link">{copy["common.continue"]} →</span>
          </Link>
        </EditableCard>
      ))}
    </div>
  );
}
export async function ProductCards({ products }: { products: SiteProduct[] }) {
  const copy = await getSiteCopy();
  return (
    <div className="product-overview-grid">
      {products.map((p) => (
        <article className="product-overview-card" key={p.slug}>
          {p.image ? (
            <img
              src={p.image}
              alt={`${p.name}${p.isExample ? "示例配图" : "产品图"}`}
            />
          ) : null}
          <div>
            <p>{p.routineStep}</p>
            <h3>{p.name}</h3>
            <span>{p.subtitle}</span>
            {p.isExample ? <ExampleNote /> : null}
            <Link href={`/chanpin/${p.slug}`}>{copy["common.product"]} →</Link>
          <EditMarker
            href={p.id ? `/admin/products/${p.id}/edit` : "/admin/products"}
            label={p.name}
          />

          </div>
        </article>
      ))}
    </div>
  );
}
export async function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const copy = await getSiteCopy();
  return (
    <nav className="site-breadcrumbs" aria-label="当前位置">
      <Link href="/">{copy["common.home"]}</Link>
      {items.map((x, i) => (
        <span key={`${x.label}-${i}`}>
          <span aria-hidden="true"> / </span>
          {x.href ? (
            <Link href={x.href}>{x.label}</Link>
          ) : (
            <span aria-current="page">{x.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SectionTags({ section }: { section: SiteSectionContent }) {
  return section.tags?.length ? (
    <div className="scene-grid section-tags">
      {section.tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  ) : null;
}
