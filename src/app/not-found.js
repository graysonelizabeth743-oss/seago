import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo />
      <p className="mt-12 font-display text-7xl font-extrabold text-link">404</p>
      <h1 className="mt-3 text-2xl font-extrabold">This page has drifted off course</h1>
      <p className="mt-2 max-w-sm text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Back to home</Button>
        <Button href="/track" variant="secondary">Track cargo</Button>
      </div>
      <Link href="/contact" className="mt-6 text-sm font-semibold text-link hover:underline">Contact support</Link>
    </div>
  );
}
