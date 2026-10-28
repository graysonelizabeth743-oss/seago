import PageIntro from "@/components/layout/PageIntro";
import Faq from "@/components/ui/Faq";
import Button from "@/components/ui/Button";
import { faqs } from "@/config/content";

export const metadata = { title: "FAQ", description: "Answers about booking, quotes, tracking and support." };

export default function FaqPage() {
  return (
    <>
      <PageIntro title="Frequently asked questions" description="Quick answers about booking, pricing, tracking and support." />
      <section className="container-x max-w-4xl py-12 sm:py-16">
        <Faq items={faqs} />
        <div className="mt-12 rounded-2xl bg-soft p-6 sm:p-8">
          <h2 className="text-xl font-bold">Didn&apos;t find your answer?</h2>
          <p className="mt-1.5 text-sm text-muted">Send us a message and we&apos;ll get back to you.</p>
          <Button href="/contact" className="mt-5">Contact us</Button>
        </div>
      </section>
    </>
  );
}
