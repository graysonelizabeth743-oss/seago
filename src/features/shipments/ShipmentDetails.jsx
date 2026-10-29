import WorldMap from "@/features/map/WorldMap";
import StatusBadge from "@/features/shipments/StatusBadge";
import Timeline from "@/features/shipments/Timeline";
import Icon from "@/components/ui/Icon";
import { Alert } from "@/components/ui/feedback";
import { HOLD_MESSAGE, HOLD_TITLE, isOnHold, verificationState } from "@/features/shipments/verification";
import { statusMeta } from "@/features/shipments/statuses";
import { containerTypes, cargoTypes, parcelContents, parcelSizes } from "@/config/logistics";
import { formatDate, formatMoney } from "@/lib/format";

function Item({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-semibold">{children || "—"}</dd>
    </div>
  );
}

function Party({ title, icon, person, accent }) {
  const p = person || {};
  return (
    <section className={`card p-5 sm:p-6 ${accent ? "border-primary/60 ring-1 ring-primary/20" : ""}`}>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Icon name={icon} size={18} className="text-link" /> {title}
      </h2>
      <p className="font-semibold">{p.name || "—"}</p>
      <p className="text-sm text-muted">{p.phone}</p>
      {p.email && <p className="break-all text-sm text-muted">{p.email}</p>}
      {p.address && (
        <address className="mt-3 text-sm not-italic leading-relaxed">
          {p.address}
          <br />
          {[p.city, p.postalCode].filter(Boolean).join(", ")}
          {p.country ? (
            <>
              <br />
              {p.country}
            </>
          ) : null}
        </address>
      )}
    </section>
  );
}

/** Read-only shipment view shared by the customer portal and the admin console. */
export default function ShipmentDetails({ shipment: s, showCustomer = false }) {
  const isParcel = s.kind !== "cargo";
  const hold = isOnHold(s);
  const vState = verificationState(s);
  const decision = typeof s.verification === "object" ? s.verification : null;
  const parcel = s.parcel || {};
  const cargo = s.cargo || {};
  const equipment = containerTypes.find((c) => c.code === cargo.containerType);
  const cargoType = cargoTypes.find((c) => c.code === cargo.type);
  const contents = parcelContents.find((c) => c.code === parcel.contents);
  const size = parcelSizes.find((c) => c.code === parcel.sizeCode);
  // Older records used shipper/consignee
  const sender = s.sender || s.shipper;
  const receiver = s.receiver || (s.consignee ? { ...s.consignee } : null);

  return (
    <div className="space-y-6">
      {/* Customers see why nothing is moving yet; admins have the verification panel instead */}
      {hold && !showCustomer && (
        <Alert tone="warning">
          <p className="font-semibold">{HOLD_TITLE}</p>
          <p className="mt-0.5">{HOLD_MESSAGE}</p>
        </Alert>
      )}
      {vState === "rejected" && !showCustomer && (
        <Alert tone="error">
          <p className="font-semibold">This shipment was cancelled after verification.</p>
          {decision?.note && <p className="mt-0.5">{decision.note}</p>}
        </Alert>
      )}

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold text-muted">{isParcel ? "Package" : "Cargo"} · Booking number</p>
            <h2 className="mt-0.5 font-mono text-xl font-bold tracking-tight sm:text-2xl">{s.bookingNumber}</h2>
          </div>
          <StatusBadge status={s.status} hold={hold} />
        </div>
        <WorldMap
          from={s.origin?.code}
          to={s.destination?.code}
          progress={s.progress ?? statusMeta(s.status).progress ?? 0}
          position={s.position}
          vesselLabel={s.position?.label}
        />
        <dl className="grid grid-cols-2 gap-5 border-t border-line p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-5">
          <Item label="Origin">{s.origin?.name}, {s.origin?.country}</Item>
          <Item label="Destination">{s.destination?.name}, {s.destination?.country}</Item>
          <Item label="Last known position">{hold ? "Awaiting verification" : s.position?.label || (s.position ? `${Number(s.position.lat).toFixed(2)}, ${Number(s.position.lng).toFixed(2)}` : "Following the status")}</Item>
          <Item label="Vessel">{s.vessel || "To be assigned"}</Item>
          <Item label="Est. arrival">{s.eta ? formatDate(s.eta) : "To be confirmed"}</Item>
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-bold">Shipment history</h2>
          <Timeline events={s.events} />
        </section>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">{isParcel ? "Package" : "Cargo"}</h2>
            {isParcel ? (
              <dl className="grid grid-cols-2 gap-4">
                <Item label="What it is">{contents?.label}</Item>
                <Item label="Box">{size?.label}</Item>
                <Item label="Weight">{parcel.weightKg != null ? `${parcel.weightKg} kg` : null}</Item>
                <Item label="Charged on">{parcel.chargeableKg != null ? `${parcel.chargeableKg} kg` : null}</Item>
                <Item label="Size">{parcel.dimsCm ? `${parcel.dimsCm.join(" × ")} cm` : null}</Item>
                <Item label="Declared value">{parcel.declaredValueUSD != null ? formatMoney(parcel.declaredValueUSD, "USD") : null}</Item>
                <div className="col-span-2"><Item label="Inside">{parcel.description}{parcel.fragile ? " (fragile)" : ""}</Item></div>
                {parcel.giftMessage && <div className="col-span-2"><Item label="Gift note">{parcel.giftMessage}</Item></div>}
                <div className="col-span-2">
                  <Item label="Estimate">
                    {s.estimate ? `${formatMoney(s.estimate.low, s.estimate.currency)} – ${formatMoney(s.estimate.high, s.estimate.currency)}` : null}
                  </Item>
                </div>
              </dl>
            ) : (
              <dl className="grid grid-cols-2 gap-4">
                <Item label="Equipment">{cargo.quantity} × {equipment?.label || cargo.containerType}</Item>
                <Item label="Type">{cargoType?.label?.replace(/ \(.*\)/, "") || cargo.type}</Item>
                <Item label="Weight">{cargo.weightKg != null ? `${Number(cargo.weightKg).toLocaleString()} kg` : null}</Item>
                <Item label="Incoterm">{cargo.incoterm}</Item>
                <Item label="Ready date">{cargo.readyDate ? formatDate(cargo.readyDate) : null}</Item>
                <Item label="Estimate">
                  {s.estimate ? `${formatMoney(s.estimate.low, s.estimate.currency)} – ${formatMoney(s.estimate.high, s.estimate.currency)}` : null}
                </Item>
                <div className="col-span-2"><Item label="Goods">{cargo.description}</Item></div>
              </dl>
            )}
            {s.notes && <p className="mt-4 border-t border-line pt-4 text-sm"><span className="font-semibold">Notes: </span><span className="text-muted">{s.notes}</span></p>}
          </section>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Party title="Sender" icon="user" person={sender} />
        <Party title="Receiver" icon="pin" person={receiver} accent />
      </div>

      {showCustomer && (
        <p className="text-sm text-muted">
          Booked by <span className="font-semibold text-ink">{s.userName || "—"}</span> ({s.userEmail})
        </p>
      )}
    </div>
  );
}
