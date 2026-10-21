import { getSiteCopy } from "@/lib/site-copy";
import { navigationCopyKeys } from "@/lib/site-copy-config";
import { SiteCopyProvider } from "@/components/site/copy-provider";
import Link from "next/link";
import { SiteNavigation } from "@/components/site/navigation";
import { getPublishedProducts } from "@/lib/products";
import { navItems } from "@/lib/homepage";
export const dynamic = "force-dynamic";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, copy] = await Promise.all([
    getPublishedProducts(),
    getSiteCopy(),
  ]);
  return (
    <SiteCopyProvider value={copy}>
      <a className="skip-link" href="#main-content">
        {copy["common.skip"]}
      </a>
      <SiteNavigation
        copy={copy}
        products={products.map(({ slug, name }) => ({ slug, name }))}
      />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <footer className="site-footer">
        <div className="site-container footer-grid">
          <div>
            <strong>{copy["brand.name"]}</strong>
            <p>{copy["footer.text"]}</p>
          </div>
          <nav aria-label="页脚导航">
            {navItems.map((x) => (
              <Link href={x.href} key={x.href}>
                {copy[navigationCopyKeys[x.href]] ?? x.label}
              </Link>
            ))}
            <Link href="/admin/login">{copy["footer.admin"]}</Link>
          </nav>
        </div>
      </footer>
    </SiteCopyProvider>
  );
}
