import { getSectionMetadata } from "@/lib/site-sections";
import { SectionPage } from "@/components/site/section-page";
export async function generateMetadata() {
  return getSectionMetadata("faq", "/changjianwenti");
}
export default function Page() {
  return <SectionPage sectionKey="faq" label="常见问题" />;
}
