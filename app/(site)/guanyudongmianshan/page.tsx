import { getSectionMetadata } from "@/lib/site-sections";
import { SectionPage } from "@/components/site/section-page";
export async function generateMetadata() {
  return getSectionMetadata("about", "/guanyudongmianshan");
}
export default function Page() {
  return <SectionPage sectionKey="about" label="品牌" />;
}
