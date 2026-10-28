import PageIntro from "@/components/layout/PageIntro";
import { Alert } from "@/components/ui/feedback";
import { legal } from "@/config/content";

export const metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <>
      <PageIntro title="Privacy policy" description={`Last updated ${legal.updated}`} />
      <section className="container-x max-w-3xl py-12 sm:py-16">
        <Alert tone="warning" className="mb-8">{legal.notice}</Alert>
        <div className="space-y-8">
          {legal.privacy.map((c, i) => (
            <div key={c.heading}>
              <h2 className="text-xl font-bold">{i + 1}. {c.heading}</h2>
              <p className="mt-2 leading-relaxed text-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
