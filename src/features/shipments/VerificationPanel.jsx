"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { adminVerifyShipment } from "@/features/shipments/api";
import { VERIFICATION_CHECKS, isOnHold, verificationState } from "@/features/shipments/verification";
import { Textarea } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatDateTime } from "@/lib/format";

/**
 * Admin card for the verification step.
 *  on hold  → checklist + Approve / Reject
 *  decided  → who decided, when, and the note
 */
export default function VerificationPanel({ shipment }) {
  const { user, profile } = useAuth();
  const [checks, setChecks] = useState(VERIFICATION_CHECKS.map(() => false));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const state = verificationState(shipment);
  const v = typeof shipment.verification === "object" ? shipment.verification : null;
  const allChecked = checks.every(Boolean);
  const adminName = profile?.name || user?.displayName || "Sea Go team";

  async function decide(decision) {
    if (decision === "reject" && !window.confirm("Reject and cancel this shipment? The customer will see your reason.")) return;
    setBusy(decision);
    setError("");
    try {
      await adminVerifyShipment(shipment, { decision, note, adminId: user?.uid, adminName });
    } catch (err) {
      console.error("[admin] verification failed", err);
      setError(err?.code === "permission-denied" ? "You don't have permission to do that." : err?.message || "Couldn't save the decision. Please try again.");
      setBusy("");
    }
  }

  if (isOnHold(shipment)) {
    return (
      <section className="card border-amber-300 p-5 ring-1 ring-amber-300/40 sm:p-6 dark:border-amber-700" aria-labelledby="verify-title">
        <h2 id="verify-title" className="flex items-center gap-2 text-lg font-bold">
          <Icon name="shield" size={18} className="text-amber-600" /> Verification required
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          This {shipment.kind === "cargo" ? "cargo" : "package"} is on hold. Inspect the real shipment, tick each check, then approve it for transport.
        </p>

        <fieldset className="mt-4 space-y-2.5">
          <legend className="sr-only">Verification checks</legend>
          {VERIFICATION_CHECKS.map((label, i) => (
            <label key={label} className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={checks[i]}
                onChange={(e) => setChecks((c) => c.map((x, j) => (j === i ? e.target.checked : x)))}
                className="mt-0.5 h-4 w-4 rounded border-line accent-[var(--c-primary)]"
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>

        <div className="mt-4">
          <Textarea
            label="Note for the customer"
            name="verifyNote"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            hint="Optional when approving. Required, and shown to the customer, if you reject."
          />
        </div>

        {error && <Alert className="mt-4">{error}</Alert>}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => decide("approve")} loading={busy === "approve"} disabled={!allChecked || !!busy}>
            <Icon name="check" size={16} /> Approve for transport
          </Button>
          <Button variant="secondary" onClick={() => decide("reject")} loading={busy === "reject"} disabled={!!busy}>
            Reject and cancel
          </Button>
        </div>
        {!allChecked && <p className="mt-2 text-xs text-muted">Tick all four checks to enable approval.</p>}
      </section>
    );
  }

  if (!v) return null; // created before verification existed

  const approved = state === "approved";
  return (
    <section
      className={`card p-5 sm:p-6 ${approved ? "border-emerald-300 dark:border-emerald-800" : "border-red-300 dark:border-red-900"}`}
      aria-labelledby="verify-title"
    >
      <h2 id="verify-title" className="flex items-center gap-2 text-lg font-bold">
        <Icon name={approved ? "success" : "alert"} size={18} className={approved ? "text-emerald-600" : "text-red-600"} />
        {approved ? "Verified and approved" : "Rejected after verification"}
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        {v.byName || "The team"} · {formatDateTime(v.at)}
      </p>
      {v.note && <p className="mt-3 rounded-lg bg-soft px-3 py-2 text-sm">{v.note}</p>}
    </section>
  );
}
