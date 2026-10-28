import Link from "next/link";
import Hero from "@/components/home/Hero";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Faq from "@/components/ui/Faq";
import WorldMap from "@/features/map/WorldMap";
import { promises, services, process as steps, faqs } from "@/config/content";
import { contact } from "@/config/site";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Promises */}
      <section className="container-x py-16 sm:py-20" aria-labelledby="why">
        <h2 id="why" className="max-w-xl text-3xl font-extrabold sm:text-4xl">
          What you can count on when you ship with us
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          {promises.map((p) => (
            <div key={p.title} className="border-t-2 border-primary pt-5">
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-soft py-16 sm:py-24" aria-labelledby="services">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="services" className="text-3xl font-extrabold sm:text-4xl">
              Whatever you&apos;re sending
            </h2>
            <p className="mt-4 max-w-md text-muted sm:text-lg">
              From a single gift box to a string of containers, choose the service that fits what you&apos;re sending.
            </p>
            <Button href="/services" variant="secondary" className="mt-7">
              All services <Icon name="arrowRight" size={16} />
            </Button>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex items-start justify-between gap-6 py-6 transition-colors hover:bg-surface/60 sm:px-2"
                >
                  <div>
                    <h3 className="text-lg font-bold transition-colors group-hover:text-link">{s.title}</h3>
                    <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted sm:text-base">{s.summary}</p>
                  </div>
                  <Icon
                    name="arrowRight"
                    size={20}
                    className="mt-1 shrink-0 text-muted transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-link"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process */}
      <section className="container-x py-16 sm:py-24" aria-labelledby="how">
        <h2 id="how" className="max-w-xl text-3xl font-extrabold sm:text-4xl">
          From estimate to doorstep in four steps
        </h2>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden="true" className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-line md:block" />
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary font-display text-lg font-extrabold text-white shadow-md shadow-sea-900/20">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Quote band */}
      <section className="container-x pb-16 sm:pb-24">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-sea-900 to-sea-700 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute -right-10 top-1/2 -z-10 hidden w-[28rem] -translate-y-1/2 opacity-60 md:block">
            <WorldMap from="NLRTM" to="USNYC" animate onDark zoomable={false} fit="full" />
          </div>
          <h2 className="max-w-lg text-3xl font-extrabold !text-white sm:text-4xl">Know your numbers before you book</h2>
          <p className="mt-4 max-w-md text-sea-100/90 sm:text-lg">
            Choose a package or cargo, pick two ports and see an indicative price and transit time in seconds. No account needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/quote" variant="light" size="lg">Open the calculator</Button>
            <Button href="/contact" variant="outlineLight" size="lg">Talk to sales</Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pb-16 sm:pb-24" aria-labelledby="faq">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 id="faq" className="text-3xl font-extrabold sm:text-4xl">Common questions</h2>
            <p className="mt-4 text-muted sm:text-lg">
              Still unsure? Email{" "}
              <a href={`mailto:${contact.email}`} className="font-semibold text-link hover:underline">{contact.email}</a>{" "}
              or message us from your account.
            </p>
            <Link href="/faq" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline">
              See all questions <Icon name="arrowRight" size={14} />
            </Link>
          </div>
          <Faq items={faqs.slice(0, 4)} />
        </div>
      </section>
    </>
  );
}
