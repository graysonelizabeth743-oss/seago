"use client";

import { RequireAdmin } from "@/features/auth/guards";
import PortalShell from "@/components/layout/PortalShell";
import { adminNav } from "@/config/site";

export default function AdminLayout({ children }) {
  return (
    <RequireAdmin>
      <PortalShell nav={adminNav} variant="admin">
        {children}
      </PortalShell>
    </RequireAdmin>
  );
}
