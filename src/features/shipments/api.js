import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
  arrayUnion,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { ports } from "@/config/logistics";
import { statusMeta } from "@/features/shipments/statuses";
import { toDate } from "@/lib/format";
import { parcelDims, chargeableKg } from "@/features/quotes/calc";
import { findRoute } from "@/features/map/routing";
import { densify, snapToPolyline } from "@/features/map/geo";

const SHIPMENTS = "shipments";
const LOOKUP = "trackingLookup";

const noop = () => {};

export function portByCode(code) {
  return ports.find((p) => p.code === code) || null;
}

/** SG- plus 10 unambiguous characters. Hard to guess, easy to read out loud. */
export function generateBookingNumber() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return "SG-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function sortNewestFirst(list) {
  return [...list].sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0));
}

/**
 * Create a booking (a package or a cargo shipment). Writes the private shipment and a
 * sanitised public tracking record in one atomic batch. Returns { id, bookingNumber }.
 */
export async function createShipment({ user, profile, form, quote }) {
  const origin = portByCode(form.originPort);
  const destination = portByCode(form.destinationPort);
  if (!origin || !destination) throw new Error("Please choose valid ports.");
  const kind = form.kind === "cargo" ? "cargo" : "parcel";

  const bookingNumber = generateBookingNumber();
  const shipmentRef = doc(collection(db, SHIPMENTS));
  const lookupRef = doc(db, LOOKUP, bookingNumber);
  const now = Timestamp.now();

  const event = {
    status: "booked",
    label: "Booking received",
    location: origin.name,
    note: "On hold until the Sea Go team has verified the shipment.",
    at: now,
  };
  const place = (p) => ({ code: p.code, name: p.name, country: p.country });
  const trim = (v) => String(v ?? "").trim();

  const dims = kind === "parcel" ? parcelDims(form) : null;
  const weights = kind === "parcel" ? chargeableKg(form.weightKg, dims) : null;

  const batch = writeBatch(db);
  batch.set(shipmentRef, {
    bookingNumber,
    kind,
    userId: user.uid,
    userName: profile?.name || user.displayName || "",
    userEmail: user.email || "",
    status: "booked",
    verification: { state: "pending" },
    progress: statusMeta("booked").progress,
    origin: place(origin),
    destination: place(destination),
    parcel:
      kind === "parcel"
        ? {
            contents: form.contents,
            description: trim(form.description),
            sizeCode: form.sizeCode,
            dimsCm: dims,
            weightKg: Number(form.weightKg),
            chargeableKg: Math.round(weights.chargeable * 10) / 10,
            declaredValueUSD: Number(form.declaredValue) || 0,
            fragile: !!form.fragile,
            giftMessage: form.contents === "gift" ? trim(form.giftMessage) : "",
          }
        : null,
    cargo:
      kind === "cargo"
        ? {
            type: form.cargoType,
            description: trim(form.description),
            containerType: form.containerType,
            quantity: Number(form.quantity),
            weightKg: Number(form.weightKg),
            readyDate: form.readyDate || "",
            incoterm: form.incoterm,
          }
        : null,
    sender: { name: trim(form.senderName), phone: trim(form.senderPhone), email: trim(form.senderEmail) },
    receiver: {
      name: trim(form.receiverName),
      phone: trim(form.receiverPhone),
      email: trim(form.receiverEmail),
      address: trim(form.receiverAddress),
      city: trim(form.receiverCity),
      postalCode: trim(form.receiverPostal),
      country: trim(form.receiverCountry) || destination.country,
    },
    notes: trim(form.notes),
    estimate: quote ? { low: quote.low, high: quote.high, transitDays: quote.transitDays, currency: quote.currency } : null,
    vessel: "",
    eta: null,
    events: [{ ...event, by: user.uid }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Public record: no names, contacts, addresses or contents.
  batch.set(lookupRef, {
    bookingNumber,
    kind,
    status: "booked",
    verification: "pending",
    progress: statusMeta("booked").progress,
    origin: place(origin),
    destination: place(destination),
    vessel: "",
    eta: null,
    events: [event],
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return { id: shipmentRef.id, bookingNumber };
}

/** Public lookup by booking number (no sign-in required). */
export async function lookupTracking(bookingNumber) {
  const ref = String(bookingNumber || "").trim().toUpperCase();
  if (!ref) return null;
  const snap = await getDoc(doc(db, LOOKUP, ref));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Live list of a customer's shipments (newest first). */
export function subscribeUserShipments(uid, onData, onError = noop) {
  if (!isFirebaseConfigured || !uid) return noop;
  // Single-field filter + client-side sort: no composite index needed.
  const q = query(collection(db, SHIPMENTS), where("userId", "==", uid));
  return onSnapshot(
    q,
    (snap) => onData(sortNewestFirst(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    onError
  );
}

/** Live list of all shipments for admins (newest 200). */
export function subscribeAllShipments(onData, onError = noop) {
  if (!isFirebaseConfigured) return noop;
  const q = query(collection(db, SHIPMENTS), orderBy("createdAt", "desc"), limit(200));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export function subscribeShipment(id, onData, onError = noop) {
  if (!isFirebaseConfigured || !id) return noop;
  return onSnapshot(
    doc(db, SHIPMENTS, id),
    (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );
}

/**
 * Admin: change status, location and/or details. Appends a timeline event and mirrors the
 * public fields (including the map position) to the tracking record. Atomic.
 *
 * `position` is { lng, lat, label } to pin the vessel on the map, or null to let the map follow
 * the status. When pinned, the route progress is worked out from where the position falls along
 * the shipment's sea route.
 */
export async function adminUpdateShipment(shipment, { status, location, note, vessel, eta, position, adminId }) {
  const meta = statusMeta(status);
  let progress = meta.progress ?? shipment.progress ?? 0;
  let pinned = null;

  // A delivered shipment is at its destination, whatever position was set before.
  if (position && status !== "delivered") {
    const lng = Number(position.lng);
    const lat = Number(position.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      throw new Error("That position isn't valid.");
    }
    pinned = { lng, lat, label: String(position.label || "").trim() };
    const route = findRoute(shipment.origin?.code, shipment.destination?.code);
    if (route) {
      progress = Math.min(1, Math.max(0, snapToPolyline(densify(route.points, 60), [lng, lat]).t));
    }
  }

  const now = Timestamp.now();
  const event = {
    status,
    label: meta.label,
    location: (location || pinned?.label || "").trim(),
    note: (note || "").trim(),
    at: now,
  };
  const etaValue = eta ? Timestamp.fromDate(new Date(eta)) : null;

  const batch = writeBatch(db);
  batch.update(doc(db, SHIPMENTS, shipment.id), {
    status,
    progress,
    position: pinned,
    vessel: (vessel || "").trim(),
    eta: etaValue,
    events: arrayUnion({ ...event, by: adminId || "" }),
    updatedAt: serverTimestamp(),
  });
  batch.set(
    doc(db, LOOKUP, shipment.bookingNumber),
    {
      bookingNumber: shipment.bookingNumber,
      status,
      progress,
      position: pinned,
      origin: shipment.origin,
      destination: shipment.destination,
      vessel: (vessel || "").trim(),
      eta: etaValue,
      events: arrayUnion(event),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();
}

/**
 * Admin: approve or reject a shipment that is on hold.
 *  approve → verification "approved", status "confirmed" (cleared for transport)
 *  reject  → verification "rejected", status "cancelled", with a reason the customer can see
 * Appends a timeline event and updates the public tracking record. Atomic.
 */
export async function adminVerifyShipment(shipment, { decision, note, adminId, adminName }) {
  const approve = decision === "approve";
  const text = String(note || "").trim();
  if (!approve && text.length < 5) throw new Error("Please give the customer a reason (at least 5 characters).");

  const status = approve ? "confirmed" : "cancelled";
  const progress = approve ? statusMeta("confirmed").progress : shipment.progress ?? 0;
  const now = Timestamp.now();
  const event = {
    status,
    label: approve ? "Verified and approved for transport" : "Cancelled after verification",
    location: shipment.origin?.name || "",
    note: text,
    at: now,
  };

  const batch = writeBatch(db);
  batch.update(doc(db, SHIPMENTS, shipment.id), {
    status,
    progress,
    verification: { state: approve ? "approved" : "rejected", note: text, by: adminId || "", byName: adminName || "", at: now },
    events: arrayUnion({ ...event, by: adminId || "" }),
    updatedAt: serverTimestamp(),
  });
  batch.set(
    doc(db, LOOKUP, shipment.bookingNumber),
    {
      bookingNumber: shipment.bookingNumber,
      status,
      progress,
      verification: approve ? "approved" : "rejected",
      origin: shipment.origin,
      destination: shipment.destination,
      events: arrayUnion(event),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();
}
