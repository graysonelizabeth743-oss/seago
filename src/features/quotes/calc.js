import { ports, containerTypes, parcelSizes, parcelLimits, parcelPricing, pricing } from "@/config/logistics";
import { seaDistanceKm } from "@/features/map/routing";

const roundTo = (n, step) => Math.round(n / step) * step;
const portOf = (code) => ports.find((p) => p.code === code);

/** Dimensions in cm for a package: from the chosen size preset, or the custom values. */
export function parcelDims({ sizeCode, dimsCm }) {
  const size = parcelSizes.find((s) => s.code === sizeCode);
  if (size?.dims) return size.dims;
  const d = (dimsCm || []).map(Number);
  return d.length === 3 && d.every((n) => n > 0) ? d : null;
}

/** Weight we charge for: the larger of actual and volumetric weight. */
export function chargeableKg(weightKg, dims) {
  const actual = Number(weightKg) || 0;
  const volumetric = dims ? (dims[0] * dims[1] * dims[2]) / parcelLimits.volumetricDivisor : 0;
  return { actualKg: actual, volumetricKg: Math.round(volumetric * 10) / 10, chargeable: Math.max(actual, volumetric) };
}

/** Indicative price for a package. Returns null if inputs are incomplete or invalid. */
export function estimateParcel({ originPort, destinationPort, sizeCode, dimsCm, weightKg, fragile = false }) {
  const origin = portOf(originPort);
  const destination = portOf(destinationPort);
  const km = seaDistanceKm(originPort, destinationPort);
  const weight = Number(weightKg);
  const dims = parcelDims({ sizeCode, dimsCm });
  if (!origin || !destination || !km || !(weight > 0) || weight > parcelLimits.maxKg || !dims) return null;

  const { actualKg, volumetricKg, chargeable } = chargeableKg(weight, dims);
  const base = parcelPricing.baseFee + chargeable * parcelPricing.perKgPer1000Km * (km / 1000) + (fragile ? parcelPricing.fragileSurcharge : 0);
  const price = Math.max(parcelPricing.minimum, base);

  return {
    kind: "parcel",
    currency: parcelPricing.currency,
    distanceKm: km,
    actualKg,
    volumetricKg,
    chargeableKg: Math.round(chargeable * 10) / 10,
    low: roundTo(price * (1 - parcelPricing.rangePercent), 1),
    high: roundTo(price * (1 + parcelPricing.rangePercent), 1),
    transitDays: Math.ceil(km / parcelPricing.cruiseKmPerDay) + parcelPricing.handlingDays,
    origin,
    destination,
    summary: "1 package",
    disclaimer: parcelPricing.disclaimer,
  };
}

/** Indicative price for container cargo. */
export function estimateCargo({ originPort, destinationPort, containerType, quantity = 1 }) {
  const origin = portOf(originPort);
  const destination = portOf(destinationPort);
  const equipment = containerTypes.find((c) => c.code === containerType);
  const km = seaDistanceKm(originPort, destinationPort);
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  if (!origin || !destination || !equipment || !km) return null;

  const perContainer = Math.max(pricing.minimum, pricing.baseFee + pricing.perKm * km * equipment.factor);
  const total = perContainer * qty;

  return {
    kind: "cargo",
    currency: pricing.currency,
    distanceKm: km,
    quantity: qty,
    low: roundTo(total * (1 - pricing.rangePercent), 10),
    high: roundTo(total * (1 + pricing.rangePercent), 10),
    transitDays: Math.ceil(km / pricing.cruiseKmPerDay) + pricing.portDays,
    origin,
    destination,
    equipment,
    summary: `${qty} × ${equipment.label}`,
    disclaimer: pricing.disclaimer,
  };
}

/** Estimate for either kind of shipment (`form.kind` is "parcel" or "cargo"). */
export function estimateQuote(form) {
  return form.kind === "cargo" ? estimateCargo(form) : estimateParcel(form);
}
