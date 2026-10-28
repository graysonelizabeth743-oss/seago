"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { PageLoader } from "@/components/ui/feedback";
import { safeNext } from "@/lib/safeNext";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <PageLoader />
    </div>
  );
}

/** Renders children only for signed-in users; otherwise redirects to /login. */
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || user) return;
    const target = window.location.pathname + window.location.search;
    router.replace(`/login?next=${encodeURIComponent(target)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) return <FullScreenLoader />;
  return children;
}

/** Admins only. Signed-in non-admins go back to their portal. */
export function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!isAdmin) router.replace("/portal");
  }, [loading, user, isAdmin, router, pathname]);

  if (loading || !user || !isAdmin) return <FullScreenLoader />;
  return children;
}

/** For login/register: signed-in users are sent on to where they belong. */
export function GuestOnly({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(safeNext(params.get("next"), isAdmin ? "/admin" : "/portal"));
  }, [loading, user, isAdmin, router, params]);

  if (loading || user) return <FullScreenLoader />;
  return children;
}
