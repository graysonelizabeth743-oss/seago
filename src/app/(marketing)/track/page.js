import { Suspense } from "react";
import PageIntro from "@/components/layout/PageIntro";
import TrackingLookup from "@/features/shipments/TrackingLookup";
import { PageLoader } from "@/components/ui/feedback";

export const metadata = {
  title: "Track a shipment",
  description: "Enter your Sea Go booking number to see where your package or cargo is and what has happened so far.",
};

export default function TrackPage() {
  return (
    <>
      <PageIntro title="Track your shipment" description="Enter your booking number to see the latest milestone. No account needed." />
      <section className="container-x py-12 sm:py-16">
        <Suspense fallback={<PageLoader />}>
          <TrackingLookup />
        </Suspense>
      </section>
    </>
  );
}
