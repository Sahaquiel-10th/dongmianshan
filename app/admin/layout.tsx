export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="cms-admin-app">{children}</div>;
}
