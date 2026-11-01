// src/features/shipments/BookingForm.jsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ports, containerTypes, cargoTypes, incoterms, shipmentKinds,
  parcelContents, parcelSizes, parcelLimits, prohibitedItems,
} from "@/config/logistics";
import { useAuth } from "@/features/auth/AuthProvider";
import { estimateQuote, parcelDims, chargeableKg } from "@/features/quotes/calc";
import { createShipment } from "@/features/shipments/api";
import { HOLD_MESSAGE, HOLD_TITLE } from "@/features/shipments/verification";
import { Input, Select, Textarea } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import WorldMap from "@/features/map/WorldMap";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

const STEPS = ["What", "Details", "Sender & receiver", "Review"];
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const has = (list, code, fallback) => (list.some((x) => x.code === code) ? code : fallback);
const portOptions = ports.map((p) => <option key={p.code} value={p.code}>{p.name}, {p.country}</option>);

function Stepper({ step }) {
  return (
    <div className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-3" aria-label="Booking steps">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3" aria-current={current ? "step" : undefined}>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done ? "bg-primary text-on-primary" : current ? "border-2 border-primary text-link" : "border border-line text-muted"
                )}
              >
                {done ? <Icon name="check" size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("hidden text-sm font-semibold lg:block", current ? "text-ink" : "text-muted")}>{label}</span>
              {i < STEPS.length - 1 && <span className={cn("h-px flex-1 transition-colors", done ? "bg-primary" : "bg-line")} />}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm font-semibold text-muted lg:hidden">
        Step {step + 1} of {STEPS.length}: <span className="text-ink">{STEPS[step]}</span>
      </p>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-semibold">{children || "—"}</dd>
    </div>
  );
}

function PartyCard({ title, icon, accent, children }) {
  return (
    <section className={cn("card space-y-5 p-5 sm:p-6", accent && "border-primary/60 ring-1 ring-primary/20")}>
      <h3 className="flex items-center gap-2.5 text-lg font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
          <Icon name={icon} size={17} />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile } = useAuth();

  const startKind = has(shipmentKinds, params.get("kind"), null);
  const dimsParam = (params.get("dims") || "").split("x").map(Number);

  const [step, setStep] = useState(startKind ? 1 : 0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState(() => ({
    kind: startKind || "parcel",
    originPort: has(ports, params.get("origin"), "GBFXT"),
    destinationPort: has(ports, params.get("dest"), "NGLOS"),
    // package
    contents: "gift",
    description: "",
    sizeCode: has(parcelSizes, params.get("size"), "medium"),
    dimsCm: dimsParam.length === 3 && dimsParam.every((n) => n > 0) ? dimsParam.map(String) : ["", "", ""],
    weightKg: params.get("weight") || "",
    declaredValue: "",
    fragile: false,
    giftMessage: "",
    // cargo
    cargoType: "general",
    containerType: has(containerTypes, params.get("container"), "40HC"),
    quantity: Math.min(50, Math.max(1, Number(params.get("qty")) || 1)),
    readyDate: "",
    incoterm: "FOB",
    // people
    senderName: profile?.name || user?.displayName || "",
    senderPhone: profile?.phone || "",
    senderEmail: user?.email || "",
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverAddress: "",
    receiverCity: "",
    receiverPostal: "",
    receiverCountry: null, // null = follow the destination port's country until edited
    notes: "",
  }));

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };
  const setDim = (i) => (e) => setForm((f) => ({ ...f, dimsCm: f.dimsCm.map((v, j) => (j === i ? e.target.value : v)) }));

  const isParcel = form.kind === "parcel";
  const quote = useMemo(() => estimateQuote(form), [form]);
  const dest = ports.find((p) => p.code === form.destinationPort);
  const origin = ports.find((p) => p.code === form.originPort);
  const size = parcelSizes.find((s) => s.code === form.sizeCode);
  const equipment = containerTypes.find((c) => c.code === form.containerType);
  const cargo = cargoTypes.find((c) => c.code === form.cargoType);
  const receiverCountry = form.receiverCountry ?? dest?.country ?? "";
  const today = new Date().toISOString().slice(0, 10);

  function validate(n) {
    const e = {};
    if (n === 1) {
      if (form.originPort === form.destinationPort) e.destinationPort = "Origin and destination must be different.";
      const w = Number(form.weightKg);
      if (isParcel) {
        if (form.description.trim().length < 3) e.description = "Say what's inside (at least 3 characters).";
        if (!form.weightKg || Number.isNaN(w) || w <= 0) e.weightKg = "Enter the weight in kg.";
        else if (w > parcelLimits.maxKg) e.weightKg = `Packages can weigh up to ${parcelLimits.maxKg} kg. Book heavier loads as cargo.`;
        else if (size?.maxKg && form.sizeCode !== "custom" && w > size.maxKg) e.weightKg = `Too heavy for a ${size.label.toLowerCase()} (max ${size.maxKg} kg). Choose a bigger box.`;
        if (form.sizeCode === "custom") {
          const d = parcelDims(form);
          if (!d) e.dims = "Enter length, width and height in cm.";
          else if (Math.max(...d) > parcelLimits.maxSideCm) e.dims = `The longest side can be ${parcelLimits.maxSideCm} cm.`;
        }
        const v = Number(form.declaredValue);
        if (form.declaredValue === "" || Number.isNaN(v) || v < 0) e.declaredValue = "Enter the value in USD (0 if it has no value).";
        if (form.giftMessage.length > 300) e.giftMessage = "Keep the gift note under 300 characters.";
      } else {
        if (cargo?.contactFirst) e.cargoType = "Please message our team before booking this cargo type.";
        const reeferBox = form.containerType.endsWith("RF");
        if (form.cargoType === "reefer" && !reeferBox) e.containerType = "Temperature-controlled cargo needs a refrigerated container.";
        if (form.cargoType !== "reefer" && reeferBox) e.cargoType = "Refrigerated containers are for temperature-controlled cargo.";
        const qty = Number(form.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 50) e.quantity = "Enter 1 to 50 containers.";
        if (!form.weightKg || Number.isNaN(w) || w <= 0) e.weightKg = "Enter the total weight in kg.";
        else if (equipment && w > equipment.capacityKg * (qty || 1)) e.weightKg = `Too heavy for ${qty || 1} × ${equipment.label} (max ${(equipment.capacityKg * (qty || 1)).toLocaleString()} kg).`;
        if (form.readyDate && form.readyDate < today) e.readyDate = "Choose today or a future date.";
        if (form.description.trim().length < 5) e.description = "Describe the goods (at least 5 characters).";
      }
    }
    if (n === 2) {
      if (form.senderName.trim().length < 2) e.senderName = "Enter the sender's name.";
      if (form.senderPhone.trim().length < 6) e.senderPhone = "Enter a phone number.";
      if (form.senderEmail && !EMAIL_RE.test(form.senderEmail.trim())) e.senderEmail = "Enter a valid email address.";
      if (form.receiverName.trim().length < 2) e.receiverName = "Enter the receiver's full name.";
      if (form.receiverPhone.trim().length < 6) e.receiverPhone = "Enter the receiver's phone number.";
      if (form.receiverEmail && !EMAIL_RE.test(form.receiverEmail.trim())) e.receiverEmail = "Enter a valid email address.";
      if (form.receiverAddress.trim().length < 5) e.receiverAddress = "Enter the street address.";
      if (form.receiverCity.trim().length < 2) e.receiverCity = "Enter the city or town.";
      if (receiverCountry.trim().length < 2) e.receiverCountry = "Enter the country.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function go(n) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function next() {
    if (step === 0 || validate(step)) go(step + 1);
  }

  async function submit() {
    if (!validate(1)) return go(1);
    if (!validate(2)) return go(2);
    setSubmitting(true);
    setSubmitError("");
    try {
      const { id } = await createShipment({ user, profile, form: { ...form, receiverCountry }, quote });
      router.replace(`/portal/shipments/${id}?booked=1`);
    } catch (err) {
      console.error("[booking] failed", err);
      setSubmitError(err?.code === "permission-denied" ? "You don't have permission to create bookings." : err?.message || "We couldn't create your booking. Please try again.");
      setSubmitting(false);
    }
  }

  const volumetric = isParcel ? chargeableKg(form.weightKg, parcelDims(form)) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div>
        <Stepper step={step} />

        {/* 1 · What */}
        {step === 0 && (
          <section aria-labelledby="s0">
            <h2 id="s0" className="text-xl font-bold">What are you sending?</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-labelledby="s0">
              {shipmentKinds.map((k) => {
                const on = form.kind === k.code;
                return (
                  <button
                    key={k.code}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setForm((f) => ({ ...f, kind: k.code }))}
                    className={cn(
                      "card flex flex-col items-start gap-3 p-6 text-left transition-[border-color,box-shadow]",
                      on ? "border-primary ring-2 ring-primary/25" : "hover:border-brand-500"
                    )}
                  >
                    <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", on ? "bg-primary text-on-primary" : "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200")}>
                      <Icon name={k.code === "parcel" ? "package" : "container"} size={24} />
                    </span>
                    <span>
                      <span className="block font-display text-lg font-bold">{k.label}</span>
                      <span className="mt-1 block text-sm text-muted">{k.blurb}</span>
                      <span className="mt-2 block text-xs text-muted/90">e.g. {k.examples}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 2 · Details */}
        {step === 1 && (
          <section className="card space-y-5 p-6 sm:p-7" aria-labelledby="s1">
            <h2 id="s1" className="text-xl font-bold">{isParcel ? "Package details" : "Cargo details"}</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <Select label={isParcel ? "Sending from" : "Origin port"} name="originPort" value={form.originPort} onChange={set("originPort")}>{portOptions}</Select>
              <Select label={isParcel ? "Delivering to" : "Destination port"} name="destinationPort" value={form.destinationPort} onChange={set("destinationPort")} error={errors.destinationPort}>{portOptions}</Select>
            </div>
            <p className="-mt-2 text-xs text-muted">Choose the port nearest to where it&apos;s collected from and delivered to. Delivery to the receiver&apos;s address is arranged on arrival.</p>

            {isParcel ? (
              <>
                <Select label="What is it?" name="contents" value={form.contents} onChange={set("contents")}>
                  {parcelContents.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </Select>
                <Textarea label="What's inside?" name="description" rows={2} value={form.description} onChange={set("description")} error={errors.description} placeholder="e.g. a pair of trainers and a birthday card" hint="Needed for customs. Be specific." />

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">Box size</legend>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {parcelSizes.map((s) => {
                      const on = form.sizeCode === s.code;
                      return (
                        <label key={s.code} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors", on ? "border-primary bg-soft" : "border-line hover:border-brand-500")}>
                          <input type="radio" name="sizeCode" value={s.code} checked={on} onChange={set("sizeCode")} className="mt-1 accent-[var(--c-primary)]" />
                          <span>
                            <span className="block text-sm font-semibold">{s.label}</span>
                            <span className="block text-xs text-muted">{s.dims ? `${s.dims.join(" × ")} cm · ` : ""}{s.hint}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {form.sizeCode === "custom" && (
                  <div>
                    <div className="grid grid-cols-3 gap-3">
                      {["Length", "Width", "Height"].map((l, i) => (
                        <Input key={l} label={`${l} (cm)`} name={`dim${i}`} type="number" inputMode="decimal" min="1" value={form.dimsCm[i]} onChange={setDim(i)} />
                      ))}
                    </div>
                    {errors.dims && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{errors.dims}</p>}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="Weight (kg)" name="weightKg" type="number" inputMode="decimal" min="0.1" step="0.1" value={form.weightKg} onChange={set("weightKg")} error={errors.weightKg}
                    hint={volumetric && volumetric.volumetricKg > volumetric.actualKg && volumetric.actualKg > 0 ? `Charged on ${Math.round(volumetric.chargeable * 10) / 10} kg (box size)` : undefined} />
                  <Input label="Value of the contents (USD)" name="declaredValue" type="number" inputMode="decimal" min="0" value={form.declaredValue} onChange={set("declaredValue")} error={errors.declaredValue} hint="Declared to customs" />
                </div>
                <label className="flex items-center gap-2.5 text-sm">
                  <input type="checkbox" checked={form.fragile} onChange={set("fragile")} className="h-4 w-4 rounded border-line accent-[var(--c-primary)]" />
                  Fragile: handle with extra care
                </label>
                {form.contents === "gift" && (
                  <Textarea label="Gift note (optional)" name="giftMessage" rows={2} value={form.giftMessage} onChange={set("giftMessage")} error={errors.giftMessage} hint="Included with the delivery. Up to 300 characters." />
                )}
                <Alert tone="info">Can&apos;t be sent: {prohibitedItems}</Alert>
              </>
            ) : (
              <>
                <Select label="Cargo type" name="cargoType" value={form.cargoType} onChange={set("cargoType")} error={errors.cargoType}>
                  {cargoTypes.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </Select>
                {cargo?.contactFirst && (
                  <Alert tone="info">
                    This cargo needs special handling. <Link href="/portal/messages" className="font-semibold underline">Message our team</Link> and we&apos;ll arrange it with you.
                  </Alert>
                )}
                <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr_1fr]">
                  <Select label="Container type" name="containerType" value={form.containerType} onChange={set("containerType")} error={errors.containerType}>
                    {containerTypes.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </Select>
                  <Input label="Containers" name="quantity" type="number" inputMode="numeric" min="1" max="50" value={form.quantity} onChange={set("quantity")} error={errors.quantity} />
                  <Input label="Total weight (kg)" name="weightKg" type="number" inputMode="decimal" min="1" value={form.weightKg} onChange={set("weightKg")} error={errors.weightKg} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="Cargo ready date" name="readyDate" type="date" min={today} value={form.readyDate} onChange={set("readyDate")} error={errors.readyDate} hint="Optional" />
                  <Select label="Incoterm" name="incoterm" value={form.incoterm} onChange={set("incoterm")}>
                    {incoterms.map((i) => <option key={i}>{i}</option>)}
                  </Select>
                </div>
                <Textarea label="Description of goods" name="description" rows={3} value={form.description} onChange={set("description")} error={errors.description} placeholder="e.g. 480 cartons of ceramic floor tiles" />
              </>
            )}
          </section>
        )}

        {/* 3 · Sender & receiver */}
        {step === 2 && (
          <div className="space-y-6" aria-labelledby="s2">
            <div>
              <h2 id="s2" className="text-xl font-bold">Who is it from, and who is it for?</h2>
              <p className="mt-1 text-sm text-muted">The receiver&apos;s full address is where we deliver. Double-check it.</p>
            </div>

            <PartyCard title="Sender (from)" icon="user">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Full name or company" name="senderName" value={form.senderName} onChange={set("senderName")} error={errors.senderName} autoComplete="name" />
                <Input label="Phone" name="senderPhone" type="tel" value={form.senderPhone} onChange={set("senderPhone")} error={errors.senderPhone} autoComplete="tel" />
              </div>
              <Input label="Email" name="senderEmail" type="email" value={form.senderEmail} onChange={set("senderEmail")} error={errors.senderEmail} autoComplete="email" />
            </PartyCard>

            <PartyCard title="Receiver (to)" icon="pin" accent>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Receiver's full name" name="receiverName" value={form.receiverName} onChange={set("receiverName")} error={errors.receiverName} autoComplete="off" />
                <Input label="Receiver's phone" name="receiverPhone" type="tel" value={form.receiverPhone} onChange={set("receiverPhone")} error={errors.receiverPhone} hint="The courier calls this number" autoComplete="off" />
              </div>
              <Input label="Receiver's email (optional)" name="receiverEmail" type="email" value={form.receiverEmail} onChange={set("receiverEmail")} error={errors.receiverEmail} autoComplete="off" />
              <Textarea label="Street address" name="receiverAddress" rows={2} value={form.receiverAddress} onChange={set("receiverAddress")} error={errors.receiverAddress} placeholder="House or building number, street, area" />
              <div className="grid gap-5 sm:grid-cols-3">
                <Input label="City or town" name="receiverCity" value={form.receiverCity} onChange={set("receiverCity")} error={errors.receiverCity} />
                <Input label="Postal code" name="receiverPostal" value={form.receiverPostal} onChange={set("receiverPostal")} hint="If they use one" />
                <Input label="Country" name="receiverCountry" value={receiverCountry} onChange={set("receiverCountry")} error={errors.receiverCountry} />
              </div>
            </PartyCard>

            <Textarea label="Notes for our team (optional)" name="notes" rows={2} value={form.notes} onChange={set("notes")} placeholder="Delivery instructions, best time to call…" />
          </div>
        )}

        {/* 4 · Review */}
        {step === 3 && (
          <div className="space-y-6">
            <section className="card p-6 sm:p-7" aria-labelledby="s3">
              <h2 id="s3" className="text-xl font-bold">Review your booking</h2>
              <p className="mt-1 text-sm text-muted">Check everything below. You can track it and message us from your portal after booking.</p>
              <dl className="mt-5 divide-y divide-line border-y border-line">
                <Row label="Type">{isParcel ? "Package" : "Cargo"}</Row>
                <Row label="Route">{origin?.name} → {dest?.name}</Row>
                {isParcel ? (
                  <>
                    <Row label="Contents">{parcelContents.find((c) => c.code === form.contents)?.label}: {form.description}</Row>
                    <Row label="Box">{size?.label}{parcelDims(form) ? ` (${parcelDims(form).join(" × ")} cm)` : ""}</Row>
                    <Row label="Weight">{form.weightKg} kg{form.fragile ? " · fragile" : ""}</Row>
                    <Row label="Declared value">{formatMoney(Number(form.declaredValue) || 0, "USD")}</Row>
                    {form.contents === "gift" && form.giftMessage && <Row label="Gift note">{form.giftMessage}</Row>}
                  </>
                ) : (
                  <>
                    <Row label="Equipment">{form.quantity} × {equipment?.label}</Row>
                    <Row label="Cargo">{cargo?.label}</Row>
                    <Row label="Weight">{Number(form.weightKg).toLocaleString()} kg</Row>
                    <Row label="Goods">{form.description}</Row>
                    <Row label="Incoterm">{form.incoterm}</Row>
                  </>
                )}
              </dl>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="card p-5">
                <h3 className="mb-3 text-sm font-bold text-muted">From (sender)</h3>
                <p className="font-semibold">{form.senderName}</p>
                <p className="text-sm text-muted">{form.senderPhone}</p>
                {form.senderEmail && <p className="text-sm text-muted">{form.senderEmail}</p>}
              </section>
              <section className="card border-primary/60 p-5 ring-1 ring-primary/20">
                <h3 className="mb-3 text-sm font-bold text-muted">To (receiver)</h3>
                <p className="font-semibold">{form.receiverName}</p>
                <p className="text-sm text-muted">{form.receiverPhone}</p>
                {form.receiverEmail && <p className="text-sm text-muted">{form.receiverEmail}</p>}
                <address className="mt-2 text-sm not-italic leading-relaxed">
                  {form.receiverAddress}<br />
                  {form.receiverCity}{form.receiverPostal ? `, ${form.receiverPostal}` : ""}<br />
                  {receiverCountry}
                </address>
              </section>
            </div>
            {form.notes && <p className="text-sm text-muted"><span className="font-semibold text-ink">Notes:</span> {form.notes}</p>}
            <Alert tone="warning">
              <p className="font-semibold">{HOLD_TITLE}</p>
              <p className="mt-0.5">After you confirm, {isParcel ? "your package" : "your cargo"} is placed on hold. {HOLD_MESSAGE}</p>
            </Alert>
            {submitError && <Alert>{submitError}</Alert>}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="secondary" onClick={() => go(step - 1)} disabled={submitting}>
              <Icon name="arrowLeft" size={16} /> Back
            </Button>
          ) : <span />}
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Continue <Icon name="arrowRight" size={16} /></Button>
          ) : (
            <Button onClick={submit} loading={submitting} size="lg">Confirm booking</Button>
          )}
        </div>
      </div>

      {/* Live route and estimate */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card overflow-hidden">
          <WorldMap from={form.originPort} to={form.destinationPort} zoomable={false} fit="route" />
          <div className="border-t border-line p-5">
            <p className="text-xs font-semibold text-muted">Indicative price</p>
            {quote ? (
              <>
                <p className="mt-1 font-display text-2xl font-extrabold tracking-tight">
                  {formatMoney(quote.low, quote.currency)} – {formatMoney(quote.high, quote.currency)}
                </p>
                <p className="mt-1 text-xs text-muted">about {quote.transitDays} days · {quote.distanceKm.toLocaleString()} km by sea</p>
                <p className="mt-3 text-xs leading-relaxed text-muted">Your confirmed price is issued after we review the booking.</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">{isParcel ? "Enter the box size and weight to see a price." : "Choose two different ports to see a price."}</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
