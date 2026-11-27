"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import StorefrontHeader from "@/components/storefront-header";
import StorefrontFooter from "@/components/storefront-footer";

export default function StorefrontShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Admin pages retain their own independent interface.
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <StorefrontHeader />

      <div>{children}</div>

      <StorefrontFooter />
    </div>
  );
}
