// src/app/(marketing)/services/page.js
import Link from "next/link";
import PageIntro from "@/components/layout/PageIntro";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { services } from "@/config/content";

export const metadata = {
  title: "Services",
  description: "Packages and gifts, online purchases, container shipping, part loads, refrigerated cargo and customs support.",
};

const ICONS = {
  "packages-and-gifts": "package",
  "online-purchases": "truck",
  "container-shipping": "container",
  "lcl-consolidation": "ship",
  reefer: "thermometer",
  "customs-support": "file",
  "project-cargo": "truck",
};

export default function ServicesPage() {
  return (
    <>
      <PageIntro title="Services" description="Send a gift or a container. Every booking gets a booking number, milestone tracking on a live map and a direct line to our team." />
      <section className="container-x py-14 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="card group flex gap-5 p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-500 sm:p-7"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                <Icon name={ICONS[s.slug] || "ship"} size={22} />
              </span>
              <span>
                <span className="block font-display text-lg font-bold group-hover:text-link">{s.title}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted">{s.summary}</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-soft p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-bold">Not sure which fits?</h2>
            <p className="mt-1 text-sm text-muted">Tell us what you&apos;re sending and we&apos;ll recommend the right option.</p>
          </div>
          <Button href="/contact">Talk to our team</Button>
        </div>
      </section>
    </>
  );
}
