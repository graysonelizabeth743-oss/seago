"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* -------------------------------------------------------------------------- */
/*  Loading screen (visual only)                                              */
/* -------------------------------------------------------------------------- */

export default function Loading({ leaving = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Keyframes live here so no tailwind.config changes are needed */}
      <style>{`
        @keyframes seago-slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .seago-spin, .seago-bar { animation: none !important; }
        }
      `}</style>

      {/* Logo with rotating yellow ring */}
      <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
        <span className="absolute inset-0 rounded-full border-4 border-yellow-100" />
        <span className="seago-spin absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-yellow-400 [animation-duration:1.1s]" />
        <Image
          src="/logo.png"
          alt="Seago logo"
          width={72}
          height={72}
          priority
          className="h-16 w-16 object-contain sm:h-[72px] sm:w-[72px]"
        />
      </div>

      {/* App name */}
      <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
        Sea<span className="text-yellow-500">go</span>
      </h1>

      {/* Progress track */}
      <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-yellow-100 sm:w-56">
        <div className="seago-bar h-full w-1/3 rounded-full bg-yellow-400 [animation:seago-slide_1.4s_ease-in-out_infinite]" />
      </div>

      <p className="mt-4 text-sm font-medium text-neutral-500">
        Getting your shipments ready…
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  AppLoader: keeps <Loading /> visible until everything has finished        */
/* -------------------------------------------------------------------------- */

/**
 * Wraps your app and shows <Loading /> until ALL of these are done:
 *   1. The browser "load" event (HTML, CSS, JS, and images on the page)
 *   2. Fonts are ready
 *   3. Every promise / async function passed in `tasks`
 *   4. `ready` is true (use this for your own data-loading state)
 *   5. `minDuration` ms have passed (avoids a flash on fast connections)
 *
 * Props
 *   children     your app
 *   ready        boolean, pass `!isLoading` from your data hooks (default true)
 *   tasks        array of Promises or functions returning Promises
 *   minDuration  minimum time to show the loader in ms (default 800)
 */
export function AppLoader({
  children,
  ready = true,
  tasks = [],
  minDuration = 800,
}) {
  const [resourcesReady, setResourcesReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  // Keep the latest tasks without re-running the effect on every render
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // Wait for the page, fonts, custom tasks, and the minimum duration
  useEffect(() => {
    let cancelled = false;

    const pageLoaded = new Promise((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", resolve, { once: true });
      }
    });

    const fontsLoaded = document.fonts?.ready ?? Promise.resolve();

    const customTasks = Promise.allSettled(
      tasksRef.current.map((task) =>
        typeof task === "function" ? task() : task
      )
    );

    const minimumTime = new Promise((resolve) =>
      setTimeout(resolve, minDuration)
    );

    Promise.all([pageLoaded, fontsLoaded, customTasks, minimumTime]).then(
      () => {
        if (!cancelled) setResourcesReady(true);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [minDuration]);

  const isDone = resourcesReady && ready;

  // Fade out, then remove the loader from the DOM
  useEffect(() => {
    if (!isDone) return;

    setLeaving(true);
    const timer = setTimeout(() => setVisible(false), 500);

    return () => clearTimeout(timer);
  }, [isDone]);

  // Lock page scroll while the loader is on screen
  useEffect(() => {
    if (!visible) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  return (
    <>
      {/* Children render underneath so their data and images start loading right away */}
      {children}
      {visible && <Loading leaving={leaving} />}
    </>
  );
}