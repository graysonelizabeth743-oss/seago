"use client";

import { use } from "react";
import Link from "next/link";
import { useShipment } from "@/features/shipments/hooks";
import ShipmentDetails from "@/features/shipments/ShipmentDetails";
import AdminShipmentControls from "@/features/shipments/AdminShipmentControls";
import VerificationPanel from "@/features/shipments/VerificationPanel";
import { isOnHold } from "@/features/shipments/verification";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { EmptyState, PageLoader } from "@/components/ui/feedback";

export default function AdminShipmentPage({ params }) {
  const { id } = use(params);
  const { shipment, loading, error } = useShipment(id);

  return (
    <>
      <Link href="/admin/shipments" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <Icon name="arrowLeft" size={16} /> All shipments
      </Link>

      {loading ? (
        <PageLoader />
      ) : error || !shipment ? (
        <div className="card">
          <EmptyState icon="ship" title="Shipment not found" action={<Button href="/admin/shipments" variant="secondary">Back to shipments</Button>} />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
          <ShipmentDetails shipment={shipment} showCustomer />
          {/* key resets the forms when a different shipment is opened */}
          <div className="space-y-6 xl:self-start">
            <VerificationPanel key={`v-${shipment.id}`} shipment={shipment} />
            <AdminShipmentControls key={shipment.id} shipment={shipment} locked={isOnHold(shipment)} />
          </div>
        </div>
      )}
    </>
  );
}
