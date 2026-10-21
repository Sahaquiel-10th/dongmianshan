import { getSectionMetadata } from "@/lib/site-sections";
import { SectionPage } from "@/components/site/section-page";
export async function generateMetadata() {
  return getSectionMetadata("contact", "/lianxiwomen");
}
export default function Page() {
  return <SectionPage sectionKey="contact" label="联系我们" />;
}
