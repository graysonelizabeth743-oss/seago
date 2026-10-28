"use client";

import { RequireAuth } from "@/features/auth/guards";
import PortalShell from "@/components/layout/PortalShell";
import { portalNav } from "@/config/site";

export default function PortalLayout({ children }) {
  return (
    <RequireAuth>
      <PortalShell nav={portalNav} variant="user">
        {children}
      </PortalShell>
    </RequireAuth>
  );
}
