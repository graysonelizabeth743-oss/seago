"use client";

import { useMemo, useState } from "react";
import { useMyShipments } from "@/features/shipments/hooks";
import { isActive } from "@/features/shipments/statuses";
import ShipmentList from "@/features/shipments/ShipmentList";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
];

export default function MyShipmentsPage() {
  const { shipments, loading, error } = useMyShipments();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return shipments.filter((s) => {
      if (filter === "active" && !isActive(s.status)) return false;
      if (filter === "delivered" && s.status !== "delivered") return false;
      if (!term) return true;
      return [s.bookingNumber, s.origin?.name, s.destination?.name, s.parcel?.description, s.cargo?.description, s.receiver?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [shipments, filter, q]);

  return (
    <>
      <PageHeader
        title="Shipments"
        description="Everything you've sent, newest first."
        action={<Button href="/portal/shipments/new"><Icon name="plus" size={16} /> Send a shipment</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-line bg-surface p-1" role="tablist" aria-label="Filter shipments">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors",
                filter === f.key ? "bg-primary text-white" : "text-muted hover:text-ink"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shipments"
            aria-label="Search shipments"
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-muted/70 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-400/30"
          />
        </div>
      </div>

      {error && <Alert className="mb-5">We couldn&apos;t load your shipments.</Alert>}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
        ) : visible.length === 0 ? (
          <EmptyState icon="ship" title={shipments.length ? "No matching shipments" : "No shipments yet"}>
            {shipments.length ? "Try a different filter or search term." : "Your bookings will appear here."}
          </EmptyState>
        ) : (
          <ShipmentList shipments={visible} hrefBase="/portal/shipments" />
        )}
      </div>
    </>
  );
}
