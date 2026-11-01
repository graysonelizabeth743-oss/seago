// src/components/layout/PortalShell.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { logoutUser } from "@/features/auth/api";
import { useChatBadge } from "@/features/chat/hooks";
import Logo from "@/components/ui/Logo";
import Icon from "@/components/ui/Icon";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

/** Pages that manage their own full-height layout (chat). */
const FULL_BLEED = ["/portal/messages", "/admin/inbox"];

function NavItems({ nav, pathname, badge, onNavigate }) {
  return (
    <ul className="space-y-1">
      {nav.map((item) => {
        const exact = item.href === "/portal" || item.href === "/admin";
        const active = exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
        // "New booking" lives under /shipments, so don't also highlight "Shipments" there
        const shadowed = item.href === "/portal/shipments" && pathname.startsWith("/portal/shipments/new");
        const isActive = active && !shadowed;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                isActive ? "bg-primary text-on-primary shadow-sm" : "text-muted hover:bg-soft hover:text-ink"
              )}
            >
              <Icon name={item.icon} size={18} />
              <span className="flex-1">{item.label}</span>
              {item.badge === "chat" && badge > 0 && (
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold leading-none",
                    isActive ? "bg-graphite-950 text-brand-300" : "bg-brand-500 text-graphite-950"
                  )}
                  aria-label={`${badge} unread`}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({ nav, variant, onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const badge = useChatBadge();
  const name = profile?.name || user?.displayName || user?.email || "Account";

  async function signOut() {
    await logoutUser();
    router.push("/");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo href={variant === "admin" ? "/admin" : "/portal"} />
        {variant === "admin" && (
          <span className="rounded-md bg-graphite-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-300 dark:bg-brand-400/15">Admin</span>
        )}
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-3" aria-label={variant === "admin" ? "Admin" : "Portal"}>
        <NavItems nav={nav} pathname={pathname} badge={badge} onNavigate={onNavigate} />
      </nav>

      <div className="space-y-3 border-t border-line p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-900 dark:bg-brand-900 dark:text-brand-100">
            {initials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={signOut}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold text-muted transition-colors hover:border-brand-500 hover:text-ink"
          >
            <Icon name="logout" size={16} /> Sign out
          </button>
          <ThemeToggle className="border border-line" />
        </div>
        {variant === "admin" ? (
          <Link href="/portal" className="block text-center text-xs font-semibold text-link hover:underline">Switch to customer view</Link>
        ) : (
          <Link href="/" className="block text-center text-xs font-semibold text-link hover:underline">Back to website</Link>
        )}
      </div>
    </div>
  );
}

export default function PortalShell({ nav, variant = "user", children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const badge = useChatBadge();
  const fullBleed = FULL_BLEED.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-dvh bg-soft">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface lg:block">
        <SidebarBody nav={nav} variant={variant} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-3 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-soft">
          <Icon name="menu" size={22} />
          {badge > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-surface" />}
        </button>
        <Logo href={variant === "admin" ? "/admin" : "/portal"} />
        <ThemeToggle />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="fade-in absolute inset-0 bg-graphite-950/60 backdrop-blur-sm" />
          <div className="sheet-in absolute inset-y-0 left-0 w-[min(18rem,86vw)] bg-surface shadow-2xl">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-soft">
              <Icon name="x" size={18} />
            </button>
            <SidebarBody nav={nav} variant={variant} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        {fullBleed ? (
          <div className="h-[calc(100dvh-3.5rem)] lg:h-dvh">{children}</div>
        ) : (
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-9">{children}</div>
        )}
      </main>
    </div>
  );
}
