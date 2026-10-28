import Link from "next/link";
import { notFound } from "next/navigation";
import PageIntro from "@/components/layout/PageIntro";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { services } from "@/config/content";

// Unknown slugs return a real 404
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  return s ? { title: s.title, description: s.summary } : {};
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();
  const others = services.filter((s) => s.slug !== slug);

  return (
    <>
      <PageIntro title={service.title} description={service.summary}>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/quote">Get a quote</Button>
          <Button href="/portal/shipments/new" variant="secondary">Send a shipment</Button>
        </div>
      </PageIntro>

      <section className="container-x grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="text-2xl font-extrabold">How it works</h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{service.detail}</p>
          <ul className="mt-8 space-y-3.5">
            {service.points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sea-100 text-sea-700 dark:bg-sea-900 dark:text-sea-200">
                  <Icon name="check" size={14} strokeWidth={3} />
                </span>
                <span className="text-sm sm:text-base">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside>
          <h2 className="text-lg font-bold">Other services</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {others.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="group flex items-center justify-between gap-3 py-3.5 text-sm font-semibold hover:text-link">
                  {s.title}
                  <Icon name="arrowRight" size={16} className="text-muted transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </>
  );
}
