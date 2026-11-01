// src/app/(admin)/admin/page.js
"use client";

import Link from "next/link";
import { useAllShipments } from "@/features/shipments/hooks";
import { useConversations } from "@/features/chat/hooks";
import { useEnquiries, useUsers } from "@/features/admin/hooks";
import { isActive } from "@/features/shipments/statuses";
import { isOnHold } from "@/features/shipments/verification";
import ShipmentList from "@/features/shipments/ShipmentList";
import PageHeader from "@/components/ui/PageHeader";
import { Alert, EmptyState } from "@/components/ui/feedback";

function Stat({ label, value, href, loading, tone }) {
  const body = (
    <>
      <p className="text-xs font-semibold text-muted">{label}</p>
      {loading ? <div className="skeleton mt-2 h-8 w-12" /> : <p className={`mt-1 font-display text-3xl font-extrabold ${tone || ""}`}>{value}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="card block p-5 transition-colors hover:border-brand-500">{body}</Link>
  ) : (
    <div className="card p-5">{body}</div>
  );
}

export default function AdminOverview() {
  const { shipments, loading, error } = useAllShipments();
  const { conversations, loading: convLoading } = useConversations();
  const { items: enquiries, loading: enqLoading } = useEnquiries();
  const { items: users, loading: usersLoading } = useUsers();

  const awaiting = shipments.filter(isOnHold);
  const delayed = shipments.filter((s) => s.status === "delayed");
  const active = shipments.filter((s) => isActive(s.status)).length;
  const unread = conversations.reduce((n, c) => n + (c.unreadAdmin || 0), 0);
  const newEnquiries = enquiries.filter((e) => e.status === "new").length;
  const attention = [...delayed, ...awaiting];

  return (
    <>
      <PageHeader title="Operations overview" description="What needs attention right now." />
      {error && <Alert className="mb-6">Couldn&apos;t load shipments. Make sure your account has the admin role and the Firestore rules are deployed.</Alert>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Active shipments" value={active} loading={loading} href="/admin/shipments" />
        <Stat label="Awaiting verification" value={awaiting.length} loading={loading} href="/admin/shipments" tone={awaiting.length ? "text-link" : ""} />
        <Stat label="Unread messages" value={unread} loading={convLoading} href="/admin/inbox" tone={unread ? "text-link" : ""} />
        <Stat label="New enquiries" value={newEnquiries} loading={enqLoading} href="/admin/enquiries" />
        <Stat label="Customers" value={users.length} loading={usersLoading} href="/admin/users" />
      </div>

      <section className="card mt-8 overflow-hidden">
        <div className="border-b border-line px-4 py-4 sm:px-6">
          <h2 className="text-lg font-bold">Needs attention</h2>
          <p className="text-sm text-muted">New bookings to verify and delayed shipments.</p>
        </div>
        {loading ? (
          <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
        ) : attention.length === 0 ? (
          <EmptyState icon="success" title="All clear">Nothing is waiting on you.</EmptyState>
        ) : (
          <ShipmentList shipments={attention.slice(0, 8)} hrefBase="/admin/shipments" showCustomer />
        )}
      </section>

      <section className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-6">
          <h2 className="text-lg font-bold">Latest bookings</h2>
          <Link href="/admin/shipments" className="text-sm font-semibold text-link hover:underline">View all</Link>
        </div>
        {!loading && shipments.length === 0 ? (
          <EmptyState icon="ship" title="No bookings yet">Customer bookings will appear here.</EmptyState>
        ) : (
          <ShipmentList shipments={shipments.slice(0, 6)} hrefBase="/admin/shipments" showCustomer />
        )}
      </section>
    </>
  );
}
