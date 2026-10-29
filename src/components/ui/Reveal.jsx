"use client";

import { useEffect, useRef } from "react";

/**
 * Fades and lifts content in as it scrolls into view.
 * Server HTML is fully visible; hiding only starts after hydration and only for content that is
 * below the fold, so there's no flash and nothing stays hidden if JavaScript fails.
 * Children can react with `group-data-[reveal=shown]:…`.
 */
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-reveal", "shown");
      return undefined;
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      el.setAttribute("data-reveal", "shown"); // already on screen: leave it be
      return undefined;
    }
    el.setAttribute("data-reveal", "hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-reveal", "shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`group ${className}`} style={{ "--reveal-delay": `${delay}s` }} {...rest}>
      {children}
    </Tag>
  );
}
