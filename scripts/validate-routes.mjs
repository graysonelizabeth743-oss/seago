// Checks the sea-lane network against real coastline data.
//  1. every port has a route to every other port
//  2. no waypoint-to-waypoint leg crosses land (canals/straits excepted)
// Run: npm run validate:routes
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";
import { NODES, EDGES, PORT_LINKS } from "../src/features/map/seaGraph.js";
import { interpolate, distanceKm } from "../src/features/map/geo.js";
import { findRoute } from "../src/features/map/routing.js";
import { ports } from "../src/config/logistics.js";

const require = createRequire(import.meta.url);
const land = feature(require("world-atlas/land-110m.json"), require("world-atlas/land-110m.json").objects.land);
const ll = ([lat, lng]) => [lng, lat];

let bad = 0;
console.log("— Land crossings on sea legs —");
for (const [a, b, flag] of EDGES) {
  if (flag) continue; // canal or narrow strait
  const A = ll(NODES[a]), B = ll(NODES[b]);
  const n = Math.max(2, Math.ceil(distanceKm(A, B) / 40));
  const hits = [];
  for (let i = 0; i <= n; i++) {
    const p = interpolate(A, B, i / n);
    if (geoContains(land, p)) hits.push(p.map((v) => v.toFixed(1)).join(","));
  }
  if (hits.length) {
    bad++;
    console.log(`  ✗ ${a}→${b}: ${hits.length}/${n + 1} samples on land, e.g. [${hits.slice(0, 3).join(" | ")}]`);
  }
}
console.log(bad ? `  ${bad} leg(s) cross land` : "  none ✓");

console.log("— Waypoints on land —");
let onLand = 0;
const NARROW = new Set(["SUEZ", "GOS2"]); // Suez canal / Gulf of Suez: too narrow for 1:110m coastline data
for (const [id, p] of Object.entries(NODES)) {
  if (NARROW.has(id)) continue;
  if (geoContains(land, ll(p))) { onLand++; console.log(`  ✗ ${id} ${p}`); }
}
console.log(onLand ? "" : "  none ✓");

console.log("— Connectivity —");
let missing = 0;
for (const a of ports) {
  if (!PORT_LINKS[a.code]) { console.log(`  ✗ ${a.code} has no PORT_LINKS`); missing++; continue; }
  for (const b of ports) {
    if (a.code !== b.code && !findRoute(a.code, b.code)) { console.log(`  ✗ no route ${a.code} → ${b.code}`); missing++; }
  }
}
console.log(missing ? "" : `  all ${ports.length * (ports.length - 1)} port pairs connected ✓`);

console.log("— Sample distances —");
for (const [a, b] of [["CNSHA","NLRTM"],["CNSHA","NGPHC"],["NLRTM","USNYC"],["USNYC","USLAX"],["NGLOS","BRSSZ"],["ZADUR","KEMBA"],["NLRTM","DEHAM"],["BRSSZ","ZACPT"]]) {
  const r = findRoute(a, b);
  console.log(`  ${a}→${b}: ${r.km.toLocaleString()} km via ${r.via.join(" ")}`);
}
process.exit(bad || onLand || missing ? 1 : 0);
