"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/config/site";
import { useAuth } from "@/features/auth/AuthProvider";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on navigation, lock page scroll while it's open
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const portalHref = isAdmin ? "/admin" : "/portal";

  return (
    <>
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200",
        scrolled ? "border-line bg-canvas/90 shadow-sm backdrop-blur-md" : "border-transparent bg-canvas"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {mainNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  active ? "text-link" : "text-muted hover:text-ink"
                )}
              >
                {item.label}
                {active && <span className="absolute inset-x-3.5 -bottom-[17px] h-0.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
            {!loading && user ? (
              <Button href={portalHref} size="sm">
                {isAdmin ? "Admin console" : "My portal"}
              </Button>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button href="/register" size="sm">
                  Get started
                </Button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-soft md:hidden"
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>
    </header>

      {/* Mobile drawer.
          Rendered OUTSIDE <header>: once scrolled, the header has backdrop-filter, which makes it the
          containing block for any fixed-position child, so the drawer would shrink to the header's height. */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="fade-in absolute inset-0 bg-sea-950/60 backdrop-blur-sm" />
          <div className="sheet-in absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-canvas shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-soft">
                <Icon name="x" size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
              {mainNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold",
                      active ? "bg-soft text-link" : "text-ink hover:bg-soft"
                    )}
                  >
                    {item.label}
                    <Icon name="chevronRight" size={16} className="text-muted" />
                  </Link>
                );
              })}
            </nav>
            <div className="space-y-2.5 border-t border-line p-5">
              {!loading && user ? (
                <Button href={portalHref} className="w-full">
                  {isAdmin ? "Admin console" : "My portal"}
                </Button>
              ) : (
                <>
                  <Button href="/register" className="w-full">Get started</Button>
                  <Button href="/login" variant="secondary" className="w-full">Sign in</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
