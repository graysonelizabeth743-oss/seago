// src/app/(admin)/admin/enquiries/page.js
"use client";

import { useState } from "react";
import { useEnquiries } from "@/features/admin/hooks";
import { setEnquiryStatus } from "@/features/admin/api";
import PageHeader from "@/components/ui/PageHeader";
import { Alert, Badge, EmptyState } from "@/components/ui/feedback";
import { formatDateTime } from "@/lib/format";

export default function EnquiriesPage() {
  const { items, loading, error } = useEnquiries();
  const [busy, setBusy] = useState(null);
  const [failed, setFailed] = useState(false);

  async function toggle(e) {
    setBusy(e.id);
    setFailed(false);
    try {
      await setEnquiryStatus(e.id, e.status === "new" ? "handled" : "new");
    } catch (err) {
      console.error("[admin] enquiry update failed", err);
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader title="Enquiries" description="Messages sent through the website contact form." />
      {error && <Alert className="mb-5">Couldn&apos;t load enquiries.</Alert>}
      {failed && <Alert className="mb-5">Couldn&apos;t update that enquiry.</Alert>}

      {loading ? (
        <div className="card space-y-3 p-6">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 w-full" />)}</div>
      ) : items.length === 0 ? (
        <div className="card"><EmptyState icon="mail" title="No enquiries yet">Messages from the contact form will appear here.</EmptyState></div>
      ) : (
        <ul className="space-y-4">
          {items.map((e) => (
            <li key={e.id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{e.name} <Badge tone={e.status === "new" ? "info" : "neutral"} className="ml-1.5">{e.status === "new" ? "New" : "Handled"}</Badge></p>
                  <p className="mt-0.5 text-sm text-muted">
                    <a href={`mailto:${e.email}`} className="font-semibold text-link hover:underline">{e.email}</a>
                    {e.phone ? ` · ${e.phone}` : ""} · {e.topic} · {formatDateTime(e.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(e)}
                  disabled={busy === e.id}
                  className="h-9 rounded-lg border border-line px-3.5 text-xs font-semibold transition-colors hover:border-brand-500 hover:text-link disabled:opacity-50"
                >
                  {e.status === "new" ? "Mark handled" : "Reopen"}
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">{e.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
