"use client";

import { useMemo, useState } from "react";
import { ports, containerTypes, parcelSizes, parcelLimits, shipmentKinds } from "@/config/logistics";
import { estimateQuote, parcelDims } from "@/features/quotes/calc";
import { Select, Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import WorldMap from "@/features/map/WorldMap";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

const portOptions = ports.map((p) => (
  <option key={p.code} value={p.code}>
    {p.name}, {p.country}
  </option>
));

export default function QuoteCalculator() {
  const [form, setForm] = useState({
    kind: "parcel",
    originPort: "GBFXT",
    destinationPort: "NGLOS",
    sizeCode: "medium",
    dimsCm: ["", "", ""],
    weightKg: "5",
    fragile: false,
    containerType: "40HC",
    quantity: 1,
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setDim = (i) => (e) => setForm((f) => ({ ...f, dimsCm: f.dimsCm.map((v, j) => (j === i ? e.target.value : v)) }));

  const quote = useMemo(() => estimateQuote(form), [form]);
  const samePort = form.originPort === form.destinationPort;
  const size = parcelSizes.find((s) => s.code === form.sizeCode);
  const heavy = form.kind === "parcel" && Number(form.weightKg) > parcelLimits.maxKg;
  const overSize = form.kind === "parcel" && size?.maxKg && Number(form.weightKg) > size.maxKg && form.sizeCode !== "custom";

  const bookParams = new URLSearchParams({ kind: form.kind, origin: form.originPort, dest: form.destinationPort });
  if (form.kind === "parcel") {
    bookParams.set("size", form.sizeCode);
    if (form.weightKg) bookParams.set("weight", form.weightKg);
    if (form.sizeCode === "custom" && parcelDims(form)) bookParams.set("dims", parcelDims(form).join("x"));
  } else {
    bookParams.set("container", form.containerType);
    bookParams.set("qty", String(Math.max(1, Number(form.quantity) || 1)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form className="card space-y-5 self-start p-6 sm:p-7" onSubmit={(e) => e.preventDefault()} noValidate>
        <div role="tablist" aria-label="What are you sending?" className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-soft p-1">
          {shipmentKinds.map((k) => (
            <button
              key={k.code}
              type="button"
              role="tab"
              aria-selected={form.kind === k.code}
              onClick={() => setForm((f) => ({ ...f, kind: k.code }))}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                form.kind === k.code ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="-mt-2 text-xs text-muted">{shipmentKinds.find((k) => k.code === form.kind)?.blurb}</p>

        <Select label="From" name="originPort" value={form.originPort} onChange={set("originPort")}>{portOptions}</Select>
        <Select label="To" name="destinationPort" value={form.destinationPort} onChange={set("destinationPort")}>{portOptions}</Select>

        {form.kind === "parcel" ? (
          <>
            <Select label="Box size" name="sizeCode" value={form.sizeCode} onChange={set("sizeCode")} hint={size?.hint}>
              {parcelSizes.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                  {s.dims ? ` (${s.dims.join(" × ")} cm)` : ""}
                </option>
              ))}
            </Select>
            {form.sizeCode === "custom" && (
              <div className="grid grid-cols-3 gap-3">
                {["Length", "Width", "Height"].map((l, i) => (
                  <Input key={l} label={`${l} (cm)`} name={`dim${i}`} type="number" inputMode="decimal" min="1" value={form.dimsCm[i]} onChange={setDim(i)} />
                ))}
              </div>
            )}
            <Input label="Weight (kg)" name="weightKg" type="number" inputMode="decimal" min="0.1" step="0.1" value={form.weightKg} onChange={set("weightKg")} />
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" checked={form.fragile} onChange={(e) => setForm((f) => ({ ...f, fragile: e.target.checked }))} className="h-4 w-4 rounded border-line accent-[var(--c-primary)]" />
              Fragile: handle with extra care
            </label>
          </>
        ) : (
          <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
            <Select label="Container type" name="containerType" value={form.containerType} onChange={set("containerType")}>
              {containerTypes.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </Select>
            <Input label="Containers" name="quantity" type="number" inputMode="numeric" min="1" max="50" value={form.quantity} onChange={set("quantity")} />
          </div>
        )}

        {samePort && <Alert tone="warning">Choose two different ports to see an estimate.</Alert>}
        {heavy && (
          <Alert tone="info">
            Packages can weigh up to {parcelLimits.maxKg} kg. For anything heavier, switch to <strong>Cargo</strong>.
          </Alert>
        )}
        {overSize && <Alert tone="warning">That&apos;s heavier than a {size.label.toLowerCase()} should hold (max {size.maxKg} kg). Try a bigger box.</Alert>}
      </form>

      <div className="card flex flex-col overflow-hidden" aria-live="polite">
        <WorldMap from={form.originPort} to={form.destinationPort} className="border-b border-line" />
        <div className="p-6 sm:p-7">
          {quote ? (
            <>
              <dl className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <dt className="text-xs font-semibold text-muted">Indicative price</dt>
                  <dd className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {formatMoney(quote.low, quote.currency)} – {formatMoney(quote.high, quote.currency)}
                  </dd>
                  <dd className="mt-1 text-xs text-muted">
                    for {quote.summary}
                    {quote.kind === "parcel" && ` · charged on ${quote.chargeableKg} kg`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">Typical transit</dt>
                  <dd className="mt-1 text-lg font-bold">{quote.transitDays} days</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">Sea route</dt>
                  <dd className="mt-1 text-lg font-bold">{quote.distanceKm.toLocaleString()} km</dd>
                </div>
              </dl>
              <p className="mt-5 text-xs leading-relaxed text-muted">{quote.disclaimer}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href={`/portal/shipments/new?${bookParams}`} className="flex-1">
                  Send this shipment <Icon name="arrowRight" size={16} />
                </Button>
                <Button href="/contact" variant="secondary" className="flex-1">
                  Ask a question
                </Button>
              </div>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted">Fill in the details on the left to see an estimate.</p>
          )}
        </div>
      </div>
    </div>
  );
}
