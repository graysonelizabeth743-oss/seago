"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/** Built-in mark, shown only when your logo file isn't in /public yet. */
function Mark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0a68a8" />
      <path
        d="M5 19c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3 1.6 1.2 2.8 1.6"
        fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M5 24c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3 1.6 1.2 2.8 1.6"
        fill="none" stroke="#74beea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M16 6l6 8H10l6-8z" fill="#fff" />
    </svg>
  );
}

/**
 * Uses /public/logo.png (see config/site.js). Falls back to a wordmark if the file is missing.
 * `onDark` swaps to `logo.srcDark` and white text for dark backgrounds.
 */
export default function Logo({ onDark = false, href = "/", className }) {
  const { logo, name } = site;
  const [failed, setFailed] = useState(false);
  const [darkFailed, setDarkFailed] = useState(false);
  const rootRef = useRef(null);

  // An image can fail before React hydrates, in which case onError never fires. Check once on mount.
  useEffect(() => {
    const imgs = rootRef.current?.querySelectorAll("img") ?? [];
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        if (img.dataset.variant === "dark") setDarkFailed(true);
        else setFailed(true);
      }
    });
  }, []);

  const lightSrc = logo.src;
  const darkSrc = logo.srcDark && !darkFailed ? logo.srcDark : "";

  const inner =
    failed || !lightSrc ? (
      <span className="inline-flex items-center gap-2.5">
        <Mark />
        <span className={cn("font-display text-xl font-extrabold tracking-tight", onDark ? "text-white" : "text-ink")}>
          {name}
        </span>
      </span>
    ) : onDark && darkSrc ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img data-variant="dark" src={darkSrc} alt={logo.alt} width={logo.width} height={logo.height} onError={() => setDarkFailed(true)} className="h-9 w-auto" />
    ) : (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lightSrc}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          onError={() => setFailed(true)}
          className={cn("h-9 w-auto", darkSrc ? "dark:hidden" : onDark ? "" : "")}
        />
        {darkSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img data-variant="dark" src={darkSrc} alt={logo.alt} width={logo.width} height={logo.height} onError={() => setDarkFailed(true)} className="hidden h-9 w-auto dark:block" />
        )}
      </>
    );

  return (
    <Link ref={rootRef} href={href} aria-label={`${name} home`} className={cn("inline-flex items-center", className)}>
      {inner}
    </Link>
  );
}
