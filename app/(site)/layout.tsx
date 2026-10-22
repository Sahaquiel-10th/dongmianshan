import { getSiteCopy } from "@/lib/site-copy";
import { navigationCopyKeys } from "@/lib/site-copy-config";
import { SiteCopyProvider } from "@/components/site/copy-provider";
import Link from "next/link";
import { SiteNavigation } from "@/components/site/navigation";
import { getPublishedProducts } from "@/lib/products";
import { navItems } from "@/lib/homepage";
import { getAdminSession } from "@/lib/auth";
import { EditMarker, SiteEditorTools } from "@/components/site/editor-tools";
export const dynamic = "force-dynamic";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, copy, allowed] = await Promise.all([
    getPublishedProducts(),
    getSiteCopy(),
    getAdminSession()
      .then((session) => !!session.isLoggedIn)
      .catch(() => false),
  ]);
  return (
    <SiteCopyProvider value={copy}>
      <SiteEditorTools allowed={allowed}>
        <a className="skip-link" href="#main-content">
          {copy["common.skip"]}
        </a>
        <SiteNavigation
          copy={copy}
          products={products.map(({ slug, name }) => ({ slug, name }))}
        />
        <div className="site-container"><EditMarker href="/admin/site-copy#copy-nav" label="顶部导航" /></div>
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
          <div className="site-container"><EditMarker href="/admin/site-copy#copy-footer" label="页脚" /></div>
        </footer>
      </SiteEditorTools>
    </SiteCopyProvider>
  );
}
