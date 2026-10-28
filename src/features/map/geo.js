// Small, dependency-free geography helpers (great-circle maths and the map projection).
import { MAP } from "./mapData.js";

const RAD = Math.PI / 180;
const EARTH_KM = 6371;

/** Natural Earth I raw projection (same formula d3-geo uses), λ and φ in radians. */
function naturalEarth1(lambda, phi) {
  const p2 = phi * phi;
  const p4 = p2 * p2;
  return [
    lambda * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4))),
    phi * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4))),
  ];
}

/** [lng, lat] in degrees → [x, y] in map units (matches mapData.js exactly). */
export function project([lng, lat]) {
  const [x, y] = naturalEarth1((lng - MAP.center) * RAD, lat * RAD);
  return [MAP.tx + MAP.k * x, MAP.ty - MAP.k * y];
}

/** Great-circle distance in km between two [lng, lat] points. */
export function distanceKm(a, b) {
  const dLat = (b[1] - a[1]) * RAD;
  const dLng = (b[0] - a[0]) * RAD;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Point a fraction t (0–1) along the great circle from a to b. */
export function interpolate(a, b, t) {
  const [lng1, lat1, lng2, lat2] = [a[0] * RAD, a[1] * RAD, b[0] * RAD, b[1] * RAD];
  const d = distanceKm(a, b) / EARTH_KM;
  if (d < 1e-9) return [a[0], a[1]];
  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);
  const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
  const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);
  return [Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD];
}

/** Densify a polyline of [lng, lat] along great circles (a point about every `stepKm`). */
export function densify(points, stepKm = 120) {
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const n = Math.max(1, Math.ceil(distanceKm(a, b) / stepKm));
    for (let s = 1; s <= n; s++) out.push(interpolate(a, b, s / n));
  }
  return out;
}

/** Cumulative distances (km) along a polyline. */
export function cumulative(points) {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + distanceKm(points[i - 1], points[i]));
  return cum;
}

/** The polyline up to fraction t of its length, and the point at that fraction. */
export function sliceAt(points, t) {
  const cum = cumulative(points);
  const total = cum[cum.length - 1];
  const target = Math.min(1, Math.max(0, t)) * total;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < target) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const f = Math.min(1, Math.max(0, (target - cum[i - 1]) / seg));
  const at = interpolate(points[i - 1], points[i], f);
  return { head: [...points.slice(0, i), at], at };
}

/** SVG path data for a polyline of [lng, lat] points. */
export function toPath(points) {
  return points
    .map((p, i) => {
      const [x, y] = project(p);
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join("");
}

/**
 * Where a position falls along a route.
 * Returns { t: 0–1 fraction of the route, at: nearest route point, distKm: how far the position is from the route }.
 */
export function snapToPolyline(points, p) {
  const cum = cumulative(points);
  const total = cum[cum.length - 1] || 1;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < points.length; i++) {
    const d = distanceKm(points[i], p);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return { t: cum[best] / total, at: points[best], distKm: bestD };
}
