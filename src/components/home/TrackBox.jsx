"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function TrackBox({ label, placeholder }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const ref = value.trim();
    router.push(ref ? `/track?ref=${encodeURIComponent(ref)}` : "/track");
  }

  return (
    <form onSubmit={onSubmit} role="search" aria-label={label} className="w-full max-w-xl">
      <label htmlFor="hero-track" className="mb-2 block text-sm font-semibold text-sea-100">
        {label}
      </label>
      <div className="flex rounded-2xl bg-white p-1.5 shadow-xl shadow-sea-950/30 ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-aqua-400">
        <div className="relative flex-1">
          <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="hero-track"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="h-12 w-full rounded-xl bg-transparent pl-11 pr-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-12 shrink-0 rounded-xl bg-sea-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-sea-700 active:scale-[0.98]"
        >
          Track
        </button>
      </div>
    </form>
  );
}
