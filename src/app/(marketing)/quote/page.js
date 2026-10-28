import PageIntro from "@/components/layout/PageIntro";
import QuoteCalculator from "@/features/quotes/QuoteCalculator";

export const metadata = {
  title: "Get a quote",
  description: "Estimate the price and transit time of sending a package or cargo by sea.",
};

export default function QuotePage() {
  return (
    <>
      <PageIntro title="Get an instant estimate" description="Choose package or cargo, then your ports. You'll see an indicative price range, typical transit time and the sea route on a map. No account needed." />
      <section className="container-x py-12 sm:py-16">
        <QuoteCalculator />
      </section>
    </>
  );
}
