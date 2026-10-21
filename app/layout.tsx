import { getSiteCopy } from "@/lib/site-copy";
import type { Metadata } from "next";
import { getSiteUrlObject } from "@/lib/site";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getSiteCopy();
  return {
    metadataBase: getSiteUrlObject(),
    icons: { icon: copy["brand.logo"] || "/icon.svg" },
    title: copy["brand.siteTitle"],
    description: copy["brand.description"],
    alternates: { canonical: "/" },
    openGraph: {
      title: copy["brand.siteTitle"],
      description: copy["brand.description"],
      url: "/",
      type: "website",
    },
    other: { "baidu-site-verification": "codeva-cOn6PU7kRG" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
