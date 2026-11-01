// src/app/(marketing)/about/page.js
import PageIntro from "@/components/layout/PageIntro";
import Button from "@/components/ui/Button";
import { about, process as steps } from "@/config/content";
import { contact } from "@/config/site";

export const metadata = { title: "About", description: about.intro };

export default function AboutPage() {
  return (
    <>
      <PageIntro title={about.title} description={about.intro} />
      <section className="container-x py-14 sm:py-20">
        <h2 className="text-2xl font-extrabold sm:text-3xl">How we work</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {about.values.map((v) => (
            <div key={v.title} className="border-t-2 border-primary pt-5">
              <h3 className="text-lg font-bold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{v.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-soft py-14 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">The booking journey</h2>
            <ol className="mt-6 space-y-5">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">{i + 1}</span>
                  <div>
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="mt-0.5 text-sm text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="card self-start p-7">
            <h2 className="text-xl font-bold">Talk to a person</h2>
            <p className="mt-2 text-sm text-muted">{contact.supportResponse}</p>
            <p className="mt-4 text-sm"><span className="font-semibold">Hours:</span> {contact.hours}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact">Contact us</Button>
              <Button href="/register" variant="secondary">Create an account</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
