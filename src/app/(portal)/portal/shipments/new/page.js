"use client";

import { Suspense } from "react";
import BookingForm from "@/features/shipments/BookingForm";
import PageHeader from "@/components/ui/PageHeader";
import { PageLoader } from "@/components/ui/feedback";

export default function NewBookingPage() {
  return (
    <>
      <PageHeader title="Send a shipment" description="A few short steps. You'll get a booking number straight away." />
      <Suspense fallback={<PageLoader />}>
        <BookingForm />
      </Suspense>
    </>
  );
}
