// src/app/(admin)/admin/users/page.js
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthProvider";
import { useUsers } from "@/features/admin/hooks";
import { setUserRole } from "@/features/admin/api";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { Alert, Badge, EmptyState } from "@/components/ui/feedback";
import { formatDate, initials } from "@/lib/format";

export default function CustomersPage() {
  const { user } = useAuth();
  const { items, loading, error } = useUsers();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((u) => [u.name, u.email, u.company].filter(Boolean).some((v) => v.toLowerCase().includes(term)));
  }, [items, q]);

  async function toggleRole(u) {
    const next = u.role === "admin" ? "user" : "admin";
    const verb = next === "admin" ? `Give ${u.name || u.email} administrator access?` : `Remove administrator access from ${u.name || u.email}?`;
    if (!window.confirm(verb)) return;
    setBusy(u.id);
    setNotice(null);
    try {
      await setUserRole(u.id, next);
      setNotice({ tone: "success", text: "Role updated." });
    } catch (err) {
      console.error("[admin] role change failed", err);
      setNotice({ tone: "error", text: "Couldn't change the role. Check your permissions." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader title="Customers" description="Everyone with an account." />
      {notice && <Alert tone={notice.tone} className="mb-5">{notice.text}</Alert>}
      {error && <Alert className="mb-5">Couldn&apos;t load customers.</Alert>}

      <div className="relative mb-5 sm:max-w-sm">
        <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, company"
          aria-label="Search customers"
          className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/35"
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
        ) : visible.length === 0 ? (
          <EmptyState icon="users" title="No customers found" />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-900 dark:bg-brand-900 dark:text-brand-100">
                  {initials(u.name || u.email)}
                </span>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate text-sm font-bold">{u.name || "—"}{u.company ? <span className="font-normal text-muted"> · {u.company}</span> : null}</p>
                  <p className="truncate text-xs text-muted">{u.email} · joined {formatDate(u.createdAt)}</p>
                </div>
                <Badge tone={u.role === "admin" ? "info" : "neutral"}>{u.role === "admin" ? "Admin" : "Customer"}</Badge>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/inbox?c=${u.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold hover:border-brand-500 hover:text-link">
                    <Icon name="message" size={14} /> Message
                  </Link>
                  {u.id !== user.uid && (
                    <button
                      type="button"
                      onClick={() => toggleRole(u)}
                      disabled={busy === u.id}
                      className="h-9 rounded-lg px-3 text-xs font-semibold text-muted transition-colors hover:bg-soft hover:text-ink disabled:opacity-50"
                    >
                      {u.role === "admin" ? "Remove admin" : "Make admin"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
