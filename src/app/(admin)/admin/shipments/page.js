"use client";

import { useMemo, useState } from "react";
import { useAllShipments } from "@/features/shipments/hooks";
import { STATUSES } from "@/features/shipments/statuses";
import { isOnHold } from "@/features/shipments/verification";
import ShipmentList from "@/features/shipments/ShipmentList";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { Alert, EmptyState } from "@/components/ui/feedback";

const selectCls =
  "h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-400/30";

export default function AdminShipmentsPage() {
  const { shipments, loading, error } = useAllShipments();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return shipments.filter((s) => {
      if (status === "hold") {
        if (!isOnHold(s)) return false;
      } else if (status !== "all" && s.status !== status) return false;
      if (!term) return true;
      return [s.bookingNumber, s.userName, s.userEmail, s.origin?.name, s.destination?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [shipments, status, q]);

  return (
    <>
      <PageHeader title="Shipments" description="All customer bookings. Open one to update its status." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search booking, customer, port"
            aria-label="Search shipments"
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-muted/70 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-400/30"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={selectCls}>
          <option value="all">All statuses</option>
          <option value="hold">On hold · awaiting verification</option>
          {STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
        </select>
      </div>

      {error && <Alert className="mb-5">Couldn&apos;t load shipments. Check the admin role and deployed rules.</Alert>}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
        ) : visible.length === 0 ? (
          <EmptyState icon="ship" title="No shipments found">Adjust the filters, or wait for new bookings.</EmptyState>
        ) : (
          <ShipmentList shipments={visible} hrefBase="/admin/shipments" showCustomer />
        )}
      </div>
      {!loading && shipments.length >= 200 && <p className="mt-3 text-xs text-muted">Showing the 200 most recent bookings.</p>}
    </>
  );
}
