// src/app/(marketing)/page.js
import Link from "next/link";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrackStrip from "@/components/home/TrackStrip";
import Hero from "@/components/home/Hero";
import PortMarquee from "@/components/home/PortMarquee";
import { GiftIllustration, ContainerIllustration } from "@/components/home/Illustrations";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Faq from "@/components/ui/Faq";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import WorldMap from "@/features/map/WorldMap";
import { promises, services, process as steps, faqs, verifyStory, carousel } from "@/config/content";
import { VERIFICATION_CHECKS } from "@/features/shipments/verification";
import { ports, parcelLimits } from "@/config/logistics";
import { contact } from "@/config/site";

const routeCount = (ports.length * (ports.length - 1)) / 2;

// Every number comes from the config files, so it stays true when you add ports or services.
const stats = [
  { value: ports.length, label: "ports in Europe, the Americas, Africa and Asia" },
  { value: routeCount, label: "port-to-port routes you can book" },
  { value: services.length, label: "ways to ship, from gifts to containers" },
  { value: parcelLimits.maxKg, suffix: " kg", label: "the heaviest single package we take" },
];

const ways = [
  {
    key: "parcel",
    title: "Send a package",
    body: "Gifts, things you bought online, personal belongings and documents.",
    points: ["Box sizes from an envelope to extra large", "Optional gift note for the receiver", "Delivered to the receiver's address"],
    cta: { label: "Send a package", href: "/portal/shipments/new?kind=parcel" },
    art: <GiftIllustration className="mx-auto h-44 w-full max-w-[15rem] text-ink" />,
  },
  {
    key: "cargo",
    title: "Ship cargo",
    body: "Full containers and commercial freight between major ports.",
    points: ["20ft and 40ft standard, high-cube and refrigerated", "Dedicated booking number per shipment", "Customs paperwork guidance"],
    cta: { label: "Book cargo", href: "/portal/shipments/new?kind=cargo" },
    art: <ContainerIllustration className="mx-auto h-44 w-full max-w-[15rem] text-ink" />,
  },
];

export default function HomePage() {
  return (
    <>
      <HeroCarousel label={carousel.label} intervalSeconds={carousel.intervalSeconds} slides={carousel.slides} />
      <TrackStrip />
      <Hero />
      <PortMarquee />

      {/* By the numbers */}
      <section className="container-x grid grid-cols-2 gap-8 py-12 md:grid-cols-4" aria-label="Sea Go at a glance">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <p className="font-display text-4xl font-extrabold tracking-tight text-link sm:text-5xl">
              <CountUp value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 max-w-[14rem] text-sm leading-snug text-muted">{s.label}</p>
          </Reveal>
        ))}
      </section>

      {/* Two ways to send */}
      <section className="bg-soft py-16 sm:py-24" aria-labelledby="ways">
        <div className="container-x">
          <Reveal>
            <h2 id="ways" className="max-w-xl text-3xl font-extrabold sm:text-4xl">
              A gift box or a container. Same tracking, same team.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {ways.map((w, i) => (
              <Reveal key={w.key} delay={i * 0.12} className="card flex flex-col p-6 sm:p-8">
                {w.art}
                <h3 className="mt-4 text-2xl font-bold">{w.title}</h3>
                <p className="mt-2 text-muted">{w.body}</p>
                <ul className="mt-5 space-y-2.5">
                  {w.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                        <Icon name="check" size={12} strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Button href={w.cta.href} className="mt-7 self-start">
                  {w.cta.label} <Icon name="arrowRight" size={16} />
                </Button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="container-x py-16 sm:py-20" aria-labelledby="why">
        <Reveal>
          <h2 id="why" className="max-w-xl text-3xl font-extrabold sm:text-4xl">
            What you can count on when you ship with us
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          {promises.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} className="border-t-2 border-primary pt-5">
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trust: every shipment is verified by people before it sails */}
      <section className="border-y border-white/10 bg-graphite-900 py-16 text-white sm:py-24" aria-labelledby="verified">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-400 text-graphite-950 shadow-lg shadow-brand-500/20">
              <Icon name="shield" size={28} />
            </span>
            <h2 id="verified" className="mt-6 max-w-xl text-3xl font-extrabold !text-white sm:text-4xl">
              {verifyStory.title}
            </h2>
            <p className="mt-4 max-w-xl text-graphite-200 sm:text-lg">{verifyStory.body}</p>
            <Button href="/faq" variant="light" className="mt-7">
              How verification works <Icon name="arrowRight" size={16} />
            </Button>
          </Reveal>

          <Reveal delay={0.12}>
            <ul className="space-y-3">
              {VERIFICATION_CHECKS.map((c) => (
                <li key={c} className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-400 text-graphite-950">
                    <Icon name="check" size={14} strokeWidth={3} />
                  </span>
                  <span className="font-medium">{c}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="bg-soft py-16 sm:py-24" aria-labelledby="services">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="services" className="text-3xl font-extrabold sm:text-4xl">
              Whatever you&apos;re sending
            </h2>
            <p className="mt-4 max-w-md text-muted sm:text-lg">
              From a single gift box to a string of containers, choose the service that fits what you&apos;re sending.
            </p>
            <Button href="/services" variant="secondary" className="mt-7">
              All services <Icon name="arrowRight" size={16} />
            </Button>
          </Reveal>

          <ul className="divide-y divide-line border-y border-line">
            {services.map((s, i) => (
              <Reveal as="li" key={s.slug} delay={i * 0.05}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group/row flex items-start justify-between gap-6 py-6 transition-colors hover:bg-surface/60 sm:px-2"
                >
                  <div>
                    <h3 className="text-lg font-bold transition-colors group-hover/row:text-link">{s.title}</h3>
                    <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted sm:text-base">{s.summary}</p>
                  </div>
                  <Icon
                    name="arrowRight"
                    size={20}
                    className="mt-1 shrink-0 text-muted transition-[transform,color] duration-200 group-hover/row:translate-x-1 group-hover/row:text-link"
                  />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Process */}
      <section className="container-x py-16 sm:py-24" aria-labelledby="how">
        <Reveal>
          <h2 id="how" className="max-w-xl text-3xl font-extrabold sm:text-4xl">
            From estimate to doorstep in four steps
          </h2>
        </Reveal>
        <Reveal as="ol" className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
          <span
            aria-hidden="true"
            className="absolute left-6 right-6 top-6 hidden origin-left scale-x-0 border-t-2 border-dashed border-brand-400 transition-transform duration-[1400ms] ease-out group-data-[reveal=shown]:scale-x-100 md:block dark:border-brand-700"
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary font-display text-lg font-extrabold text-on-primary shadow-md shadow-brand-700/25">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{s.body}</p>
            </li>
          ))}
        </Reveal>
      </section>

      {/* Quote band */}
      <section className="container-x pb-16 sm:pb-24">
        <Reveal className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-graphite-900 to-graphite-800 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute -right-10 top-1/2 -z-10 hidden w-[28rem] -translate-y-1/2 opacity-60 md:block">
            <WorldMap from="NLRTM" to="USNYC" animate onDark zoomable={false} fit="full" />
          </div>
          <h2 className="max-w-lg text-3xl font-extrabold !text-white sm:text-4xl">Know your numbers before you book</h2>
          <p className="mt-4 max-w-md text-graphite-200 sm:text-lg">
            Choose a package or cargo, pick two ports and see an indicative price and transit time in seconds. No account needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/quote" variant="light" size="lg">Open the calculator</Button>
            <Button href="/contact" variant="outlineLight" size="lg">Talk to sales</Button>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="container-x pb-16 sm:pb-24" aria-labelledby="faq">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <h2 id="faq" className="text-3xl font-extrabold sm:text-4xl">Common questions</h2>
            <p className="mt-4 text-muted sm:text-lg">
              Still unsure? Email{" "}
              <a href={`mailto:${contact.email}`} className="font-semibold text-link hover:underline">{contact.email}</a>{" "}
              or message us from your account.
            </p>
            <Link href="/faq" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline">
              See all questions <Icon name="arrowRight" size={14} />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <Faq items={faqs.slice(0, 5)} />
          </Reveal>
        </div>
      </section>
    </>
  );
}