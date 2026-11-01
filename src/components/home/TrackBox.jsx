// src/components/home/TrackBox.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Booking-number lookup. Follows the light/dark theme. */
export default function TrackBox({ label, placeholder, className }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const ref = value.trim();
    router.push(ref ? `/track?ref=${encodeURIComponent(ref)}` : "/track");
  }

  return (
    <form onSubmit={onSubmit} role="search" aria-label={label} className={cn("w-full", className)}>
      <label htmlFor="hero-track" className="sr-only">
        {label}
      </label>
      <div className="flex rounded-2xl border border-line bg-surface p-1.5 shadow-[var(--shadow-card)] transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30">
        <div className="relative flex-1">
          <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="hero-track"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="h-12 w-full rounded-xl bg-transparent pl-11 pr-2 text-sm font-medium text-ink placeholder:text-muted/70 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-12 shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-on-primary transition-[background-color,transform] hover:bg-primary-hover active:scale-[0.98]"
        >
          Track
        </button>
      </div>
    </form>
  );
}