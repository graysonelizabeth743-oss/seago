// src/components/home/Hero.jsx
import { hero, heroTrust } from "@/config/content";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Waves from "@/components/ui/Waves";
import Globe from "@/features/globe/Globe";
import { Stars, Gulls, Ships } from "@/components/home/SeaLife";

const delay = (s) => ({ animationDelay: `${s}s` });

const chip =
  "bob inline-flex items-center gap-2 rounded-full border border-line bg-surface/85 px-3.5 py-2 text-xs font-semibold text-ink shadow-[var(--shadow-card)] backdrop-blur-md " +
  "dark:border-white/20 dark:bg-white/10 dark:text-white dark:shadow-lg dark:shadow-graphite-950/40";

/**
 * Home hero. It follows the light/dark toggle: cream and white with graphite type in light,
 * graphite with gold in dark. The tracking bar now lives above it (see TrackStrip).
 */
export default function Hero() {
  return (
    <section className="hero relative isolate overflow-hidden text-ink">
      <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10" />
      <div aria-hidden="true" className="hero-dots absolute inset-0 -z-10" />
      <Stars />
      <Gulls />

      <div className="container-x relative grid items-center gap-6 pb-48 pt-8 sm:pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-4 lg:pb-56 lg:pt-14">
        {/* The globe leads: first on phones, on the right on wide screens */}
        <div className="rise relative order-1 mx-auto w-full max-w-[19rem] sm:max-w-md lg:order-2 lg:max-w-[35rem]" style={delay(0.05)}>
          <Globe className="w-full" />

          {/* Decorative status chips drifting around the globe */}
          <div aria-hidden="true" className="pointer-events-none absolute left-0 top-[14%] hidden sm:block">
            <div className={chip}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white dark:bg-emerald-400 dark:text-graphite-950">✓</span>
              Verified and approved
            </div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[12%] right-0 hidden sm:block">
            <div className={chip} style={{ animationDelay: "-2.4s" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              In transit · Strait of Malacca
            </div>
          </div>
        </div>

        <div className="order-2 lg:order-1">
          <h1
            className="rise max-w-2xl text-[2.25rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl"
            style={delay(0.15)}
          >
            {hero.title}
          </h1>
          <p className="rise mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg" style={delay(0.3)}>
            {hero.subtitle}
          </p>

          <div className="rise mt-9 flex flex-wrap gap-3" style={delay(0.45)}>
            <Button href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.href} variant="secondary" size="lg">
              {hero.secondaryCta.label}
            </Button>
          </div>

          <ul className="rise mt-8 flex flex-wrap gap-x-6 gap-y-2.5" style={delay(0.6)}>
            {heroTrust.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm font-medium text-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-400 text-graphite-950">
                  <Icon name="check" size={12} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Waves>
        <Ships />
      </Waves>
    </section>
  );
}