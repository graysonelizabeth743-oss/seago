// src/app/(portal)/portal/page.js
"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/AuthProvider";
import { useMyShipments } from "@/features/shipments/hooks";
import { isActive } from "@/features/shipments/statuses";
import { isOnHold } from "@/features/shipments/verification";
import ShipmentList from "@/features/shipments/ShipmentList";
import { useChatBadge } from "@/features/chat/hooks";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Alert, EmptyState } from "@/components/ui/feedback";

function Stat({ label, value, loading }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-muted">{label}</p>
      {loading ? <div className="skeleton mt-2 h-8 w-12" /> : <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>}
    </div>
  );
}

export default function PortalOverview() {
  const { user, profile } = useAuth();
  const { shipments, loading, error } = useMyShipments();
  const unread = useChatBadge();

  const first = (profile?.name || user?.displayName || "").split(" ")[0];
  const active = shipments.filter((s) => isActive(s.status)).length;
  const delivered = shipments.filter((s) => s.status === "delivered").length;
  const onHold = shipments.filter(isOnHold).length;

  return (
    <>
      <PageHeader
        title={first ? `Hello, ${first}` : "Overview"}
        description="Your shipments and messages at a glance."
        action={<Button href="/portal/shipments/new"><Icon name="plus" size={16} /> Send a shipment</Button>}
      />

      {onHold > 0 && (
        <Alert tone="warning" className="mb-6">
          {onHold === 1 ? "1 shipment is" : `${onHold} shipments are`} on hold while the Sea Go team verifies {onHold === 1 ? "it" : "them"}. We inspect the actual package before approving it for transport.
        </Alert>
      )}
      {error && <Alert className="mb-6">We couldn&apos;t load your shipments. Check your connection and permissions.</Alert>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active shipments" value={active} loading={loading} />
        <Stat label="Delivered" value={delivered} loading={loading} />
        <Stat label="Total shipments" value={shipments.length} loading={loading} />
        <Link href="/portal/messages" className="card group p-5 transition-colors hover:border-brand-500">
          <p className="text-xs font-semibold text-muted">Messages</p>
          <p className="mt-1 font-display text-3xl font-extrabold">{unread > 0 ? `${unread} new` : "Chat"}</p>
          <p className="mt-0.5 text-xs text-link group-hover:underline">Open conversation</p>
        </Link>
      </div>

      <section className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-6">
          <h2 className="text-lg font-bold">Recent shipments</h2>
          {shipments.length > 5 && <Link href="/portal/shipments" className="text-sm font-semibold text-link hover:underline">View all</Link>}
        </div>
        {loading ? (
          <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
        ) : shipments.length === 0 ? (
          <EmptyState
            icon="ship"
            title="No shipments yet"
            action={<Button href="/portal/shipments/new">Send your first shipment</Button>}
          >
            Send a package or book cargo. Get an estimate, add the details and we&apos;ll confirm the sailing.
          </EmptyState>
        ) : (
          <ShipmentList shipments={shipments.slice(0, 5)} hrefBase="/portal/shipments" />
        )}
      </section>
    </>
  );
}
