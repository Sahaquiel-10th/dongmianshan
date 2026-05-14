import type { Metadata } from "next";
import { getSiteUrlObject } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: "东面山 - 东方熟龄肌男士护肤",
  description: "东面山官网，提供熟龄男士三步护肤产品、肌肤测试和护肤知识内容。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "东面山 - 东方熟龄肌男士护肤开创者",
    description: "东面山品牌落地页，聚焦东方熟龄肌男士护肤方案。",
    url: "/",
    type: "website",
  },
  other: {
    "baidu-site-verification": "codeva-cOn6PU7kRG",
  },
};

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
