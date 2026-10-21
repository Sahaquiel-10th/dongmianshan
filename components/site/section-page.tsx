import { getSiteCopy } from "@/lib/site-copy";
import {
  getPublishedSiteSection,
  type SiteSectionKey,
} from "@/lib/site-sections";
import {
  Breadcrumbs,
  SectionIntro,
  SectionItems,
  SectionLink,
} from "./content";
export async function SectionPage({
  sectionKey,
  label,
}: {
  sectionKey: SiteSectionKey;
  label: string;
}) {
  const copy = await getSiteCopy();
  const section = await getPublishedSiteSection(sectionKey);
  return (
    <main className="brand-subpage">
      <div className="site-container">
        <Breadcrumbs
          items={[
            {
              label:
                copy[
                  (
                    {
                      about: "nav.brand",
                      contact: "nav.contact",
                      faq: "nav.faq",
                    } as Record<string, keyof typeof copy>
                  )[sectionKey]
                ] ?? label,
            },
          ]}
        />
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
