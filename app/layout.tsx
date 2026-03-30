import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "东面山 - 东方熟龄肌男士护肤开创者",
  description: "东面山品牌落地页，聚焦东方熟龄肌男士护肤方案。",
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
