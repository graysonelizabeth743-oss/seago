// src/features/shipments/TrackingLookup.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { lookupTracking } from "@/features/shipments/api";
import { statusMeta } from "@/features/shipments/statuses";
import { isOnHold } from "@/features/shipments/verification";
import StatusBadge from "@/features/shipments/StatusBadge";
import Timeline from "@/features/shipments/Timeline";
import WorldMap from "@/features/map/WorldMap";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { Alert, Spinner } from "@/components/ui/feedback";
import { isFirebaseConfigured } from "@/lib/firebase";
import { formatDate } from "@/lib/format";

export default function TrackingLookup() {
  const router = useRouter();
  const params = useSearchParams();
  const ref = (params.get("ref") || "").trim().toUpperCase();

  const [input, setInput] = useState(ref);
  const [state, setState] = useState({ ref: "", status: "idle", data: null });

  useEffect(() => {
    if (!ref) return undefined;
    let cancelled = false;
    if (!isFirebaseConfigured) {
      setState({ ref, status: "unconfigured", data: null });
      return undefined;
    }
    setState({ ref, status: "loading", data: null });
    lookupTracking(ref)
      .then((data) => !cancelled && setState({ ref, status: data ? "found" : "missing", data }))
      .catch((err) => {
        console.error("[track] lookup failed", err);
        if (!cancelled) setState({ ref, status: "error", data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [ref]);

  function onSubmit(e) {
    e.preventDefault();
    const next = input.trim();
    router.push(next ? `/track?ref=${encodeURIComponent(next)}` : "/track");
  }

  const current = state.ref === ref ? state : { status: ref ? "loading" : "idle", data: null };
  const data = current.data;

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={onSubmit} role="search" className="card p-3 sm:p-4">
        <label htmlFor="track-ref" className="sr-only">Booking number</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="track-ref"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Booking number, e.g. SG-8F3K2A9XQ1"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="h-12 w-full rounded-xl border border-line bg-canvas pl-11 pr-3 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/35"
            />
          </div>
          <Button type="submit" size="lg">Track</Button>
        </div>
      </form>

      <div className="mt-8" aria-live="polite">
        {current.status === "loading" && (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-muted" role="status">
            <Spinner /> Looking up {ref}…
          </div>
        )}
        {current.status === "unconfigured" && <Alert tone="warning">Tracking needs Firebase credentials. See README.md.</Alert>}
        {current.status === "error" && <Alert>We couldn&apos;t look that up right now. Please try again in a moment.</Alert>}
        {current.status === "missing" && (
          <Alert tone="info">
            <p className="font-semibold">No shipment found for {ref}.</p>
            <p className="mt-1">Check the number for typos. Booking numbers start with SG- and are shown in your confirmation.</p>
          </Alert>
        )}

        {current.status === "found" && data && (
          <div className="card pop-in overflow-hidden">
            <div className="border-b border-line p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted">Booking number</p>
                  <p className="mt-0.5 font-mono text-xl font-bold tracking-tight">{data.bookingNumber}</p>
                </div>
                <StatusBadge status={data.status} hold={isOnHold(data)} />
              </div>
              {isOnHold(data) && (
                <Alert tone="warning" className="mt-5">
                  This shipment is on hold while the Sea Go team verifies it. It will start moving once it has been approved for transport.
                </Alert>
              )}
              <WorldMap
                from={data.origin?.code}
                to={data.destination?.code}
                progress={data.progress ?? statusMeta(data.status).progress ?? 0}
                position={data.position}
                vesselLabel={data.position?.label}
                className="mt-6 overflow-hidden rounded-xl border border-line"
              />
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold text-muted">From</dt>
                  <dd className="mt-0.5 text-sm font-semibold">{data.origin?.name}, {data.origin?.country}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">To</dt>
                  <dd className="mt-0.5 text-sm font-semibold">{data.destination?.name}, {data.destination?.country}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">Estimated arrival</dt>
                  <dd className="mt-0.5 text-sm font-semibold">{data.eta ? formatDate(data.eta) : "To be confirmed"}</dd>
                </div>
                {data.position?.label && (
                  <div>
                    <dt className="text-xs font-semibold text-muted">Last known position</dt>
                    <dd className="mt-0.5 text-sm font-semibold">{data.position.label}</dd>
                  </div>
                )}
                {data.vessel && (
                  <div>
                    <dt className="text-xs font-semibold text-muted">Vessel</dt>
                    <dd className="mt-0.5 text-sm font-semibold">{data.vessel}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="p-6 sm:p-8">
              <h2 className="mb-5 text-lg font-bold">Shipment history</h2>
              <Timeline events={data.events} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
