// Finds a realistic sea route between two ports through the sea-lane network.
import { ports } from "../../config/logistics.js";
import { NODES, EDGES, PORT_LINKS, NODE_NAMES } from "./seaGraph.js";
import { distanceKm, cumulative } from "./geo.js";

const lngLat = ([lat, lng]) => [lng, lat];

// Adjacency list of waypoint nodes
const graph = {};
for (const id of Object.keys(NODES)) graph[id] = [];
for (const [a, b] of EDGES) {
  const w = distanceKm(lngLat(NODES[a]), lngLat(NODES[b]));
  graph[a].push([b, w]);
  graph[b].push([a, w]);
}

const portByCode = Object.fromEntries(ports.map((p) => [p.code, p]));
const cache = new Map();

/**
 * Route between two port codes.
 * Returns { points: [[lng, lat], …] (port → waypoints → port), km } or null.
 */
export function findRoute(fromCode, toCode) {
  const key = `${fromCode}>${toCode}`;
  if (cache.has(key)) return cache.get(key);

  const from = portByCode[fromCode];
  const to = portByCode[toCode];
  if (!from || !to || fromCode === toCode) return null;

  const start = [from.lng, from.lat];
  const end = [to.lng, to.lat];

  // Dijkstra with virtual START / END nodes attached to each port's harbour links
  const dist = { START: 0 };
  const prev = {};
  const visited = new Set();
  const queue = [["START", 0]];
  const linksOut = Object.fromEntries((PORT_LINKS[fromCode] || []).map((n) => [n, distanceKm(start, lngLat(NODES[n]))]));
  const linksIn = Object.fromEntries((PORT_LINKS[toCode] || []).map((n) => [n, distanceKm(end, lngLat(NODES[n]))]));

  while (queue.length) {
    queue.sort((a, b) => a[1] - b[1]);
    const [u, d] = queue.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === "END") break;

    const neighbours = u === "START" ? Object.entries(linksOut) : [...graph[u]];
    if (u !== "START" && linksIn[u] !== undefined) neighbours.push(["END", linksIn[u]]);

    for (const [v, w] of neighbours) {
      if (visited.has(v)) continue;
      const nd = d + w;
      if (nd < (dist[v] ?? Infinity)) {
        dist[v] = nd;
        prev[v] = u;
        queue.push([v, nd]);
      }
    }
  }

  if (dist.END === undefined) {
    cache.set(key, null);
    return null;
  }

  const ids = [];
  for (let n = prev.END; n && n !== "START"; n = prev[n]) ids.unshift(n);
  const points = [start, ...ids.map((id) => lngLat(NODES[id])), end];
  const cum = cumulative(points);
  const route = { points, km: Math.round(cum[cum.length - 1]), via: ids };
  cache.set(key, route);
  return route;
}

export function seaDistanceKm(fromCode, toCode) {
  return findRoute(fromCode, toCode)?.km ?? null;
}

/**
 * Named places along a route, in sailing order: origin port, named waypoints, destination port.
 * Each has { id, name, point: [lng, lat], t } where t (0–1) is how far along the route it is.
 */
export function routeStops(fromCode, toCode) {
  const route = findRoute(fromCode, toCode);
  if (!route) return [];
  const cum = cumulative(route.points);
  const total = cum[cum.length - 1] || 1;
  const last = route.points.length - 1;
  const stops = [{ id: "origin", name: `${portByCode[fromCode].name} (origin port)`, point: route.points[0], t: 0 }];
  route.via.forEach((id, i) => {
    if (NODE_NAMES[id]) stops.push({ id, name: NODE_NAMES[id], point: route.points[i + 1], t: cum[i + 1] / total });
  });
  stops.push({ id: "destination", name: `${portByCode[toCode].name} (destination port)`, point: route.points[last], t: 1 });
  return stops;
}
