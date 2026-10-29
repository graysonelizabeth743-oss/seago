import { hero } from "@/config/content";
import Button from "@/components/ui/Button";
import Waves from "@/components/ui/Waves";
import Globe from "@/features/globe/Globe";
import TrackBox from "@/components/home/TrackBox";
import { Stars, Gulls, Ships } from "@/components/home/SeaLife";

const delay = (s) => ({ animationDelay: `${s}s` });

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-sea-950 via-sea-900 to-sea-700 text-white">
      {/* Atmosphere: soft light from the horizon, faint dotted grid, stars */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60rem 30rem at 78% 40%, rgba(63,160,220,0.38), transparent 60%), radial-gradient(40rem 20rem at 8% 0%, rgba(45,212,224,0.12), transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <Stars />
      <Gulls />

      <div className="container-x relative grid items-center gap-6 pb-48 pt-8 sm:pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-4 lg:pb-56 lg:pt-14">
        {/* The globe leads: first on phones, on the right on wide screens */}
        <div className="rise relative order-1 mx-auto w-full max-w-[19rem] sm:max-w-md lg:order-2 lg:max-w-[35rem]" style={delay(0.05)}>
          <Globe className="w-full" />

          {/* Decorative status chips drifting around the globe */}
          <div aria-hidden="true" className="pointer-events-none absolute left-0 top-[14%] hidden sm:block">
            <div className="bob inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-sea-950/30 backdrop-blur-md">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[10px] text-sea-950">✓</span>
              Verified and approved
            </div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[12%] right-0 hidden sm:block">
            <div className="bob inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-sea-950/30 backdrop-blur-md" style={{ animationDelay: "-2.4s" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua-400" />
              </span>
              In transit · Strait of Malacca
            </div>
          </div>
        </div>

        <div className="order-2 lg:order-1">
          <h1
            className="rise max-w-2xl text-[2.25rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl"
            style={delay(0.15)}
          >
            {hero.title}
          </h1>
          <p className="rise mt-6 max-w-xl text-base leading-relaxed text-sea-100/90 sm:text-lg" style={delay(0.3)}>
            {hero.subtitle}
          </p>

          <div className="rise mt-9" style={delay(0.45)}>
            <TrackBox label={hero.trackLabel} placeholder={hero.trackPlaceholder} />
          </div>

          <div className="rise mt-6 flex flex-wrap gap-3" style={delay(0.6)}>
            <Button href={hero.primaryCta.href} variant="light" size="lg">
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.href} variant="outlineLight" size="lg">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>
      </div>

      <Waves>
        <Ships />
      </Waves>
    </section>
  );
}
