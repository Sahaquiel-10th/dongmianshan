"use client";
import { navigationCopyKeys, type SiteCopy } from "@/lib/site-copy-config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems, topLinks } from "@/lib/homepage";
export function SiteNavigation({
  products,
  copy,
}: {
  products: { slug: string; name: string }[];
  copy: SiteCopy;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="site-container utility-inner">
          <span className="site-claim">{copy["brand.tagline"]}</span>
          <nav aria-label="辅助导航">
            {topLinks.map((x) => (
              <Link href={x.href} key={x.href}>
                {copy[navigationCopyKeys[x.href]] ?? x.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="site-container main-nav">
        <Link className="brand-mark" href="/" onClick={() => setOpen(false)}>
          {copy["brand.logo"] ? (
            <img
              className="brand-logo"
              src={copy["brand.logo"]}
              alt={copy["brand.name"]}
            />
          ) : (
            <span>{copy["brand.name"]}</span>
          )}
          <small>{copy["brand.tagline"]}</small>
        </Link>
        <button
          className="mobile-menu-toggle"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? copy["nav.collapse"] : copy["nav.expand"]}
        </button>
        <nav
          className={`primary-nav ${open ? "is-open" : ""}`}
          id="main-navigation"
          aria-label="主导航"
        >
          {navItems.map((item) => {
            const children =
              item.href === "/chanpin"
                ? products.map((p) => ({
                    label: p.name,
                    href: `/chanpin/${p.slug}`,
                  }))
                : item.children;
            const current =
              pathname === item.href ||
              (item.href === "/guanyudongmianshan" &&
                pathname.startsWith("/brand-introduction")) ||
              (item.href === "/chanpin" && pathname.startsWith("/chanpin/")) ||
              (item.href === "/hufuzhishi" &&
                ![
                  "/",
                  "/guanyudongmianshan",
                  "/goumai",
                  "/chanpin",
                  "/lianxiwomen",
                  "/sousuo",
                ].includes(pathname) &&
                !pathname.startsWith("/chanpin/") &&
                !pathname.startsWith("/brand-introduction"));
            return (
              <div className="nav-item" key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {copy[navigationCopyKeys[item.href]] ?? item.label}
                </Link>
                {children?.length ? (
                  <div className="nav-dropdown">
                    {children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                      >
                        {copy[
                          (
                            {
                              "/guanyudongmianshan": "nav.brandIdea",
                              "/brand-introduction": "nav.brandStory",
                              "/audience-awareness": "nav.audience",
                              "/problem-solving": "nav.concerns",
                              "/usage-guide": "nav.usage",
                              "/core-ingredients": "nav.ingredients",
                              "/skincare-science": "nav.science",
                            } as Record<string, keyof SiteCopy>
                          )[child.href]
                        ] ?? child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
