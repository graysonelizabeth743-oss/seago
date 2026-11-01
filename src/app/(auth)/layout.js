// src/app/(auth)/layout.js
import { Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Waves from "@/components/ui/Waves";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { PageLoader } from "@/components/ui/feedback";
import { site } from "@/config/site";

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col bg-canvas">
        <header className="flex items-center justify-between px-5 py-4 sm:px-10">
          <Logo />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10">
          <div className="w-full max-w-md">
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </div>
        </main>
        <footer className="px-5 py-5 text-center text-xs text-muted sm:px-10">
          <Link href="/" className="hover:text-ink">← Back to {site.name}</Link>
        </footer>
      </div>

      <aside className="relative isolate hidden overflow-hidden bg-gradient-to-b from-graphite-950 via-graphite-900 to-graphite-800 text-white lg:block" aria-hidden="true">
        <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "radial-gradient(40rem 24rem at 70% 70%, rgba(255,198,26,0.22), transparent 60%)" }} />
        <div className="flex h-full flex-col justify-center px-14 pb-40">
          <p className="max-w-md font-display text-4xl font-extrabold leading-tight !text-white">
            Every milestone. Every message. One place.
          </p>
          <p className="mt-5 max-w-sm text-graphite-200">
            Book containers, follow your cargo port to port and talk to our team without leaving your account.
          </p>
        </div>
        <Waves fill="#1d1c17" forceDark />
      </aside>
    </div>
  );
}