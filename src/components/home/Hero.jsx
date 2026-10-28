import { hero } from "@/config/content";
import Button from "@/components/ui/Button";
import Waves from "@/components/ui/Waves";
import WorldMap from "@/features/map/WorldMap";
import TrackBox from "@/components/home/TrackBox";

const delay = (s) => ({ animationDelay: `${s}s` });

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-sea-950 via-sea-900 to-sea-700 text-white">
      {/* Atmosphere: soft light from the horizon, faint dotted grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60rem 28rem at 78% 58%, rgba(63,160,220,0.35), transparent 60%), radial-gradient(40rem 20rem at 10% 0%, rgba(45,212,224,0.12), transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <div className="container-x relative grid items-center gap-12 pb-44 pt-14 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:pb-52 lg:pt-24">
        <div>
          <h1
            className="rise max-w-2xl text-[2.35rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl"
            style={delay(0.05)}
          >
            {hero.title}
          </h1>
          <p className="rise mt-6 max-w-xl text-base leading-relaxed text-sea-100/90 sm:text-lg" style={delay(0.2)}>
            {hero.subtitle}
          </p>

          <div className="rise mt-9" style={delay(0.35)}>
            <TrackBox label={hero.trackLabel} placeholder={hero.trackPlaceholder} />
          </div>

          <div className="rise mt-6 flex flex-wrap gap-3" style={delay(0.5)}>
            <Button href={hero.primaryCta.href} variant="light" size="lg">
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.href} variant="outlineLight" size="lg">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        {/* A real map with a vessel looping along an example sea route */}
        <div className="rise relative mx-auto w-full max-w-xl lg:max-w-none" style={delay(0.45)}>
          <div className="bob overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-2xl shadow-sea-950/40 backdrop-blur-sm">
            <div className="flex items-center justify-between px-5 pt-4 text-xs font-semibold text-sea-100/80">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua-400" />
                </span>
                Live route tracking
              </span>
              <span>Example: Singapore to Rotterdam</span>
            </div>
            <WorldMap from="SGSIN" to="NLRTM" animate onDark zoomable={false} fit="full" label="Example sea route from Singapore to Rotterdam" />
          </div>
        </div>
      </div>

      <Waves />
    </section>
  );
}
