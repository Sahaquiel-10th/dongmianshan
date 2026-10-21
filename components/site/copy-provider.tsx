"use client";
import { createContext, useContext } from "react";
import { DEFAULT_SITE_COPY, type SiteCopy } from "@/lib/site-copy-config";
const CopyContext = createContext<SiteCopy>({ ...DEFAULT_SITE_COPY });
export function SiteCopyProvider({
  value,
  children,
}: {
  value: SiteCopy;
  children: React.ReactNode;
}) {
  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}
export const useSiteCopy = () => useContext(CopyContext);
