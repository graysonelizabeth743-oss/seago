"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useShipment } from "@/features/shipments/hooks";
import ShipmentDetails from "@/features/shipments/ShipmentDetails";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Alert, EmptyState, PageLoader } from "@/components/ui/feedback";

function BookedBanner({ bookingNumber }) {
  const params = useSearchParams();
  if (!params.get("booked")) return null;
  return (
    <Alert tone="success" className="mb-6">
      <p className="font-semibold">Booking received.</p>
      <p className="mt-0.5">
        Your booking number is <span className="font-mono font-bold">{bookingNumber}</span>. Share it with anyone who needs to track this cargo. Our team will confirm the sailing shortly.
      </p>
    </Alert>
  );
}

export default function ShipmentPage({ params }) {
  const { id } = use(params);
  const { shipment, loading, error } = useShipment(id);

  return (
    <>
      <Link href="/portal/shipments" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <Icon name="arrowLeft" size={16} /> All shipments
      </Link>

      {loading ? (
        <PageLoader />
      ) : error || !shipment ? (
        <div className="card">
          <EmptyState icon="ship" title="Shipment not found" action={<Button href="/portal/shipments" variant="secondary">Back to shipments</Button>}>
            It may not exist, or it belongs to a different account.
          </EmptyState>
        </div>
      ) : (
        <>
          <Suspense fallback={null}>
            <BookedBanner bookingNumber={shipment.bookingNumber} />
          </Suspense>
          <ShipmentDetails shipment={shipment} />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5">
            <div>
              <p className="font-bold">Questions about this shipment?</p>
              <p className="text-sm text-muted">Quote {shipment.bookingNumber} when you message us.</p>
            </div>
            <Button href="/portal/messages"><Icon name="message" size={16} /> Message support</Button>
          </div>
        </>
      )}
    </>
  );
}
