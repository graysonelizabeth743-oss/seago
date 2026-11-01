// src/components/home/HeroCarousel.jsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Full-width carousel for the top of the home page. Content comes from `carousel` in config/content.js.
 *
 * Production behaviour:
 *  - fixed height, so nothing shifts while images load; the first image loads eagerly, the rest lazily
 *  - autoplay pauses on hover, on keyboard focus, when scrolled out of view, in a background tab,
 *    and via the visible pause button (WCAG 2.2.2). It never autoplays for people who prefer reduced motion
 *  - swipe on touch, arrow keys, previous/next buttons and clickable progress bars
 *  - slides that aren't showing are inert, so keyboard and screen-reader users only meet the current one
 *  - if an image fails to load, the slide keeps its dark background and text
 */
export default function HeroCarousel({ label = "Highlights", intervalSeconds = 6, slides = [] }) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [failed, setFailed] = useState({});
  const rootRef = useRef(null);
  const swipe = useRef(null);

  const go = useCallback((n) => setIndex(((n % count) + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // An image can fail before React is listening for onError (fast 404), so also check on mount and on each slide change.
  useEffect(() => {
    rootRef.current?.querySelectorAll("img[data-slide]").forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        const i = Number(img.dataset.slide);
        setFailed((f) => (f[i] ? f : { ...f, [i]: true }));
      }
    });
  }, [index]);

  const autoplayAllowed = !reduced && count > 1;
  const playing = autoplayAllowed && !userPaused && !hover && !focused && inView && !tabHidden;

  function onKeyDown(e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  }

  // Swipe (touch and pen only, so mouse text selection is untouched)
  function onPointerDown(e) {
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp(e) {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
  }

  if (!count) return null;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      onFocus={(e) => e.target.matches?.(":focus-visible") && setFocused(true)}
      onBlur={(e) => !rootRef.current?.contains(e.relatedTarget) && setFocused(false)}
      style={{ touchAction: "pan-y" }}
      className="relative isolate h-[30rem] overflow-hidden bg-graphite-950 text-white sm:h-[32rem] lg:h-[34rem]"
    >
      <div aria-live={playing ? "off" : "polite"} className="absolute inset-0">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              inert={!active ? true : undefined}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out",
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              )}
            >
              {!failed[i] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.image}
                  alt={s.alt}
                  data-slide={i}
                  width={s.width || 1600}
                  height={s.height || 700}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                  draggable={false}
                  onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                  className={cn(
                    "absolute inset-0 h-full w-full select-none object-cover object-[70%_center] transition-transform duration-[7000ms] ease-out sm:object-center",
                    active ? "scale-100" : "scale-110"
                  )}
                />
              )}
              <div className="carousel-shade absolute inset-0" aria-hidden="true" />

              <div className="container-x relative flex h-full items-end pb-24 sm:pb-28 lg:items-center lg:pb-12">
                <div
                  className={cn(
                    "max-w-xl transition-[opacity,transform] duration-700 ease-out",
                    active ? "translate-y-0 opacity-100 delay-200" : "translate-y-4 opacity-0"
                  )}
                >
                  <span className="inline-block rounded-full bg-brand-400 px-3 py-1 text-xs font-bold text-graphite-950">{s.kicker}</span>
                  <p className="mt-4 font-display text-[1.85rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {s.title}
                  </p>
                  <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-graphite-100 sm:text-base lg:text-lg">{s.body}</p>
                  {s.cta && (
                    <Button href={s.cta.href} size="lg" className="mt-6">
                      {s.cta.label} <Icon name="arrowRight" size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="container-x flex items-center justify-between gap-4 pb-5">
          <div className="flex items-center gap-2" role="group" aria-label="Choose a slide">
            {slides.map((s, i) => {
              const active = i === index;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}: ${s.kicker}`}
                  aria-current={active ? "true" : undefined}
                  className="group flex h-8 w-11 items-center sm:w-16"
                >
                  <span className="relative block h-1 w-full overflow-hidden rounded-full bg-white/30 transition-colors group-hover:bg-white/50">
                    {active && (
                      <span
                        key={index}
                        className={cn("absolute inset-0 rounded-full bg-brand-400", autoplayAllowed && !userPaused && "carousel-fill")}
                        style={
                          autoplayAllowed && !userPaused
                            ? { animationDuration: `${intervalSeconds}s`, animationPlayState: playing ? "running" : "paused" }
                            : undefined
                        }
                        onAnimationEnd={next}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {autoplayAllowed && (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-pressed={userPaused}
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                className="ctl"
              >
                {userPaused ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z" fill="currentColor" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" fill="currentColor" /></svg>
                )}
              </button>
            )}
            <button type="button" onClick={prev} aria-label="Previous slide" className="ctl">
              <Icon name="arrowLeft" size={16} />
            </button>
            <button type="button" onClick={next} aria-label="Next slide" className="ctl">
              <Icon name="arrowRight" size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}