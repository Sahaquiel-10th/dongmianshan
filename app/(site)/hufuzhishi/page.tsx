import { getSectionMetadata } from "@/lib/site-sections";
import { getSiteCopy } from "@/lib/site-copy";
import type { Metadata } from "next";
import { getPublishedSiteSection } from "@/lib/site-sections";
import {
  Breadcrumbs,
  SectionIntro,
  SectionItems,
  SectionLink,
} from "@/components/site/content";
export async function generateMetadata() {
  return getSectionMetadata("education", "/hufuzhishi");
}
export default async function CarePage() {
  const copy = await getSiteCopy();
  const section = await getPublishedSiteSection("education");
  return (
    <main className="brand-subpage">
      <div className="site-container">
        <Breadcrumbs items={[{ label: copy["nav.care"] }]} />
      </div>
      <section className="subpage-hero">
        <div className="site-container">
          <SectionIntro section={section} />
          <SectionLink section={section} />
        </div>
      </section>
      <section className="site-section">
        <div className="site-container education-grid">
          <SectionItems section={section} />
        </div>
      </section>
    </main>
  );
}
