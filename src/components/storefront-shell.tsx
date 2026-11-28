"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import StorefrontHeader from "@/components/storefront-header";
import StorefrontFooter from "@/components/storefront-footer";

function StorefrontShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Admin pages retain their own independent interface.
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <StorefrontHeader />
      <div>{children}</div>
      <StorefrontFooter />
    </>
  );
}

export default function StorefrontShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <StorefrontShellContent>{children}</StorefrontShellContent>
    </Suspense>
  );
}
