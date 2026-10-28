/**
 * Shipment lifecycle. `progress` (0–1) positions the vessel on the route graphic.
 * `delayed` and `cancelled` keep the previous progress.
 */
export const STATUSES = [
  { code: "booked", label: "Booking received", tone: "info", progress: 0.04 },
  { code: "confirmed", label: "Booking confirmed", tone: "info", progress: 0.1 },
  { code: "gated_in", label: "Cargo received at terminal", tone: "info", progress: 0.18 },
  { code: "loaded", label: "Loaded on vessel", tone: "info", progress: 0.25 },
  { code: "departed", label: "Vessel departed", tone: "info", progress: 0.35 },
  { code: "in_transit", label: "In transit", tone: "info", progress: 0.55 },
  { code: "transhipment", label: "Transhipment", tone: "info", progress: 0.65 },
  { code: "arrived", label: "Arrived at destination port", tone: "info", progress: 0.88 },
  { code: "discharged", label: "Discharged", tone: "info", progress: 0.93 },
  { code: "customs", label: "Customs clearance", tone: "warning", progress: 0.96 },
  { code: "delivered", label: "Delivered", tone: "success", progress: 1 },
  { code: "delayed", label: "Delayed", tone: "warning", progress: null },
  { code: "cancelled", label: "Cancelled", tone: "danger", progress: null },
];

const byCode = Object.fromEntries(STATUSES.map((s) => [s.code, s]));

export function statusMeta(code) {
  return byCode[code] || { code, label: code || "Unknown", tone: "neutral", progress: null };
}

export const CLOSED_STATUSES = ["delivered", "cancelled"];

export function isActive(code) {
  return !CLOSED_STATUSES.includes(code);
}
