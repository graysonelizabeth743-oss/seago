"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { STATUSES } from "@/features/shipments/statuses";
import { adminUpdateShipment } from "@/features/shipments/api";
import { useAuth } from "@/features/auth/AuthProvider";
import { routeStops } from "@/features/map/routing";
import WorldMap from "@/features/map/WorldMap";
import { Input, Select, Textarea } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { toDate } from "@/lib/format";

function isoDate(value) {
  const d = toDate(value);
  return d ? d.toISOString().slice(0, 10) : "";
}

const AUTO = "auto";
const CUSTOM = "custom";

export default function AdminShipmentControls({ shipment }) {
  const { user } = useAuth();
  const stops = useMemo(() => routeStops(shipment.origin?.code, shipment.destination?.code), [shipment.origin?.code, shipment.destination?.code]);

  // Start from the position already saved on the shipment, if any
  const saved = shipment.position;
  const savedStop = saved ? stops.find((s) => Math.abs(s.point[0] - saved.lng) < 0.01 && Math.abs(s.point[1] - saved.lat) < 0.01) : null;

  const [form, setForm] = useState({
    status: shipment.status,
    where: saved ? (savedStop ? savedStop.id : CUSTOM) : AUTO,
    lat: saved && !savedStop ? String(saved.lat) : "",
    lng: saved && !savedStop ? String(saved.lng) : "",
    location: "",
    note: "",
    vessel: shipment.vessel || "",
    eta: isoDate(shipment.eta),
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Choosing a named place also fills in the timeline text (still editable)
  function chooseWhere(e) {
    const value = e.target.value;
    const stop = stops.find((s) => s.id === value);
    setForm((f) => ({ ...f, where: value, location: stop ? stop.name : value === AUTO ? "" : f.location }));
  }

  // The position this form would save
  const pending = useMemo(() => {
    if (form.where === AUTO) return null;
    if (form.where === CUSTOM) {
      const lat = Number(form.lat);
      const lng = Number(form.lng);
      if (form.lat === "" || form.lng === "" || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
      return { lat, lng, label: form.location.trim() };
    }
    const stop = stops.find((s) => s.id === form.where);
    return stop ? { lng: stop.point[0], lat: stop.point[1], label: stop.name } : null;
  }, [form.where, form.lat, form.lng, form.location, stops]);

  const customInvalid = form.where === CUSTOM && !pending;

  async function onSubmit(e) {
    e.preventDefault();
    if (customInvalid) {
      setNotice({ tone: "error", text: "Enter a valid latitude (−90 to 90) and longitude (−180 to 180)." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      await adminUpdateShipment(shipment, {
        status: form.status,
        location: form.location,
        note: form.note,
        vessel: form.vessel,
        eta: form.eta,
        position: pending,
        adminId: user.uid,
      });
      setForm((f) => ({ ...f, note: "" }));
      setNotice({ tone: "success", text: "Shipment updated. The map, the customer's page and public tracking now show this location." });
    } catch (err) {
      console.error("[admin] update failed", err);
      setNotice({
        tone: "error",
        text: err?.code === "permission-denied" ? "You don't have permission to update shipments." : err?.message || "Update failed. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-5 sm:p-6" aria-labelledby="update-title">
      <h2 id="update-title" className="text-lg font-bold">Update shipment</h2>
      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      <Select label="Status" name="status" value={form.status} onChange={set("status")}>
        {STATUSES.map((s) => (
          <option key={s.code} value={s.code}>{s.label}</option>
        ))}
      </Select>

      <div className="space-y-3">
        <Select
          label="Current location on the map"
          name="where"
          value={form.where}
          onChange={chooseWhere}
          hint="Moves the vessel on the customer's map and the public tracking map."
        >
          <option value={AUTO}>Automatic (follow the status)</option>
          {stops.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value={CUSTOM}>Somewhere else (enter coordinates)</option>
        </Select>

        {form.where === CUSTOM && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitude" name="lat" type="number" inputMode="decimal" step="any" value={form.lat} onChange={set("lat")} placeholder="e.g. 12.5" />
            <Input label="Longitude" name="lng" type="number" inputMode="decimal" step="any" value={form.lng} onChange={set("lng")} placeholder="e.g. 44.1" />
          </div>
        )}

        {/* Live preview of what customers will see */}
        <div className="overflow-hidden rounded-xl border border-line">
          <WorldMap
            from={shipment.origin?.code}
            to={shipment.destination?.code}
            progress={shipment.progress ?? 0}
            position={pending}
            vesselLabel={pending?.label || ""}
            zoomable={false}
            fit="route"
            label="Preview of the shipment's position"
          />
          <p className="border-t border-line bg-soft px-3 py-2 text-xs text-muted">
            <Icon name="eye" size={12} className="mr-1 inline" />
            Preview {pending ? `· ${pending.label || `${pending.lat.toFixed(2)}, ${pending.lng.toFixed(2)}`}` : form.where === AUTO ? "· following the status" : ""}
          </p>
        </div>
      </div>

      <Input label="Location text for the timeline" name="location" value={form.location} onChange={set("location")} placeholder="e.g. Suez Canal, waiting to transit" hint="Shown in the shipment history" />
      <Textarea label="Note for the customer" name="note" rows={2} value={form.note} onChange={set("note")} hint="Optional. Visible on the public tracking page." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Vessel" name="vessel" value={form.vessel} onChange={set("vessel")} placeholder="Vessel / voyage" />
        <Input label="Estimated arrival" name="eta" type="date" value={form.eta} onChange={set("eta")} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={saving}>Save update</Button>
        <Button href={`/admin/inbox?c=${shipment.userId}`} variant="secondary">
          <Icon name="message" size={16} /> Message customer
        </Button>
      </div>
      <p className="text-xs text-muted">
        Public tracking link: <Link href={`/track?ref=${shipment.bookingNumber}`} className="font-semibold text-link hover:underline">/track?ref={shipment.bookingNumber}</Link>
      </p>
    </form>
  );
}
