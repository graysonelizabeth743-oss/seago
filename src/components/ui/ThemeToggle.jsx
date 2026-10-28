"use client";

import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { THEME_KEY } from "@/lib/theme";

/**
 * Flips between light and dark. The initial theme is applied before paint by an
 * inline script in layout.js, so both icons are rendered and CSS shows the right
 * one (no hydration mismatch, no flash).
 */
export default function ThemeToggle({ className, onDark = false }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable (private mode): theme still applies for this visit */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
        onDark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-soft hover:text-ink",
        className
      )}
    >
      <Icon name="moon" size={18} className="dark:hidden" />
      <Icon name="sun" size={18} className="hidden dark:block" />
    </button>
  );
}
