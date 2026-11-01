// src/features/map/WorldMap.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MAP } from "@/features/map/mapData";
import { ports } from "@/config/logistics";
import { findRoute } from "@/features/map/routing";
import { densify, project, sliceAt, snapToPolyline, toPath } from "@/features/map/geo";
import { cn } from "@/lib/cn";

const W = MAP.width;
const H = MAP.height;
const FULL = [0, 0, W, H];

const portPoint = Object.fromEntries(ports.map((p) => [p.code, { ...p, xy: project([p.lng, p.lat]) }]));

/** Expand a box around its centre until it has aspect ratio r (width / height). */
function fitAspect([x, y, w, h], r) {
  if (w / h < r) {
    const nw = h * r;
    return [x - (nw - w) / 2, y, nw, h];
  }
  const nh = w / r;
  return [x, y - (nh - h) / 2, w, nh];
}

/** A viewBox around the route, padded, at aspect ratio r. Never wider than the whole map. */
function routeView(xs, ys, r) {
  const pad = 70;
  const minX = Math.min(...xs) - pad;
  const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad;
  const maxY = Math.max(...ys) + pad;
  let box = fitAspect([minX, minY, maxX - minX, maxY - minY], r);
  if (box[2] < 130) box = fitAspect([box[0] + box[2] / 2 - 65, box[1] + box[3] / 2 - 65 / r, 130, 130 / r], r);
  if (box[2] >= W) return fitAspect(FULL, r);
  // keep inside the map horizontally
  box[0] = Math.min(Math.max(box[0], 0), W - box[2]);
  return box;
}

function useWidth(ref) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/**
 * Real-coastline map of the Americas, Europe, Africa and Asia (up to East Asia) with a sea route drawn
 * through actual shipping lanes.
 *
 *  from / to   port codes (see config/logistics.js)
 *  progress    0–1: fills the travelled part and places the vessel
 *  position    { lng, lat } or [lng, lat]: the vessel's actual location (an admin-set position wins over `progress`)
 *  vesselLabel short text shown beside the vessel, e.g. "Suez Canal"
 *  animate     loop a vessel along the whole route (decorative, e.g. the home page)
 *  onDark      colours for always-dark backgrounds
 *  zoomable    show the "Zoom to route" control (on by default)
 */
export default function WorldMap({ from, to, progress = null, position = null, vesselLabel = "", animate = false, onDark = false, zoomable = true, fit = "auto", className, label }) {
  const wrapRef = useRef(null);
  const width = useWidth(wrapRef);
  const [mode, setMode] = useState(null); // null = automatic, "full" | "route" = chosen by the user

  const route = useMemo(() => (from && to ? findRoute(from, to) : null), [from, to]);

  // Phones get a taller map so the route stays readable
  const narrow = width > 0 && width < 560;
  const aspect = narrow ? 1.3 : W / H;

  const posLng = position ? Number(position.lng ?? position[0]) : NaN;
  const posLat = position ? Number(position.lat ?? position[1]) : NaN;

  const geo = useMemo(() => {
    if (!route) return null;
    const dense = densify(route.points, 90);
    const xy = dense.map(project);
    let done = null;
    let vessel = null;
    if (Number.isFinite(posLng) && Number.isFinite(posLat)) {
      // Admin-set position: draw the travelled line up to the nearest point on the route,
      // and put the vessel at the real position (unless it is essentially on the route).
      const snap = snapToPolyline(dense, [posLng, posLat]);
      done = sliceAt(dense, snap.t);
      vessel = project(snap.distKm > 150 ? [posLng, posLat] : snap.at);
    } else if (progress != null) {
      done = sliceAt(dense, progress);
      vessel = project(done.at);
    }
    return {
      d: toPath(dense),
      doneD: done ? toPath(done.head) : null,
      vessel,
      xs: xy.map((p) => p[0]),
      ys: xy.map((p) => p[1]),
    };
  }, [route, progress, posLng, posLat]);

  // Small screens start zoomed to the route so labels stay readable; wide ones show the whole map
  const auto = narrow ? "route" : "full";
  const active = fit !== "auto" ? fit : mode || auto;
  const target = active === "route" && geo ? routeView(geo.xs, geo.ys, aspect) : fitAspect(FULL, aspect);
  const targetKey = target.join(",");

  const [vb, setVb] = useState(FULL);
  const vbRef = useRef(FULL);
  const first = useRef(true);

  useEffect(() => {
    const goal = targetKey.split(",").map(Number);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (first.current || reduce) {
      first.current = false;
      vbRef.current = goal;
      setVb(goal);
      return undefined;
    }
    const start = vbRef.current;
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 550);
      const e = 1 - Math.pow(1 - t, 3);
      const cur = start.map((v, i) => v + (goal[i] - v) * e);
      vbRef.current = cur;
      setVb(cur);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetKey]);

  const o = portPoint[from];
  const d = portPoint[to];
  const u = vb[2] / (width || 800); // map units per screen pixel: keeps text and markers a constant on-screen size
  const zoomedIn = vb[2] < 380;

  // Keep labels inside the visible area
  function anchor(x) {
    if (x < vb[0] + 90 * u) return "start";
    if (x > vb[0] + vb[2] - 90 * u) return "end";
    return "middle";
  }
  const close = o && d && Math.hypot(o.xy[0] - d.xy[0], o.xy[1] - d.xy[1]) < 70 * u;

  const Label = ({ p, dy }) => (
    <text
      x={p.xy[0]}
      y={p.xy[1] + dy * u}
      textAnchor={anchor(p.xy[0])}
      fontSize={12.5 * u}
      fontWeight="700"
      fill="var(--m-label)"
      stroke="var(--m-halo)"
      strokeWidth={3.5 * u}
      strokeLinejoin="round"
      paintOrder="stroke"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {p.name}
    </text>
  );

  return (
    <div ref={wrapRef} className={cn("relative", className)} style={{ aspectRatio: aspect }}>
      <svg
        viewBox={vb.map((n) => n.toFixed(2)).join(" ")}
        role="img"
        aria-label={label || (o && d ? `Sea route from ${o.name} to ${d.name}` : "Map")}
        className={cn("worldmap block h-full w-full", onDark && "on-dark")}
      >
        <rect x="-400" y="-400" width={W + 800} height={H + 800} fill="var(--m-sea)" />
        <path d={MAP.land} fill="var(--m-land)" />
        <path d={MAP.borders} fill="none" stroke="var(--m-border)" strokeWidth={0.6 * Math.max(u, 0.5)} strokeLinejoin="round" />

        {/* Other ports */}
        {Object.values(portPoint).map((p) =>
          p.code === from || p.code === to ? null : (
            <g key={p.code}>
              <circle cx={p.xy[0]} cy={p.xy[1]} r={2.3 * u} fill="var(--m-port)" />
              {zoomedIn && (
                <text x={p.xy[0] + 5 * u} y={p.xy[1] + 3.5 * u} fontSize={9.5 * u} fill="var(--m-label)" opacity="0.7" stroke="var(--m-halo)" strokeWidth={2.5 * u} paintOrder="stroke" style={{ fontFamily: "var(--font-sans)" }}>
                  {p.name}
                </text>
              )}
            </g>
          )
        )}

        {geo && (
          <>
            <path d={geo.d} fill="none" stroke="var(--m-route)" strokeWidth={2 * u} strokeDasharray={`${1.5 * u} ${6 * u}`} strokeLinecap="round" />
            {animate && (
              <path d={geo.d} pathLength="100" fill="none" stroke="var(--m-done)" strokeWidth={2.8 * u} strokeLinecap="round" className="draw-line" />
            )}
            {geo.doneD && <path d={geo.doneD} fill="none" stroke="var(--m-done)" strokeWidth={3 * u} strokeLinecap="round" strokeLinejoin="round" />}
          </>
        )}

        {/* Origin and destination */}
        {[o, d].map((p, i) =>
          p ? (
            <g key={i}>
              <circle cx={p.xy[0]} cy={p.xy[1]} r={7 * u} fill="var(--m-done)" opacity="0.2" />
              <circle cx={p.xy[0]} cy={p.xy[1]} r={4.2 * u} fill={i === 0 ? "var(--m-done)" : "#ffffff"} stroke="var(--m-done)" strokeWidth={2.2 * u} />
            </g>
          ) : null
        )}
        {o && <Label p={o} dy={close ? -11 : 20} />}
        {d && <Label p={d} dy={close ? 22 : -11} />}

        {/* Vessel */}
        {geo?.vessel && !animate && (
          <g transform={`translate(${geo.vessel[0]} ${geo.vessel[1]})`}>
            <circle r={11 * u} fill="var(--m-done)" opacity="0.25" className="ping-ring" />
            <circle r={6 * u} fill="#ffffff" stroke="var(--m-done)" strokeWidth={3 * u} />
            {vesselLabel && (
              <text
                y={-13 * u}
                textAnchor="middle"
                fontSize={11 * u}
                fontWeight="700"
                fill="var(--m-label)"
                stroke="var(--m-halo)"
                strokeWidth={3 * u}
                strokeLinejoin="round"
                paintOrder="stroke"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {vesselLabel}
              </text>
            )}
          </g>
        )}
        {geo && animate && (
          <g>
            <circle r={9 * u} fill="var(--m-done)" opacity="0.28" />
            <circle r={4.8 * u} fill="#ffffff" stroke="var(--m-done)" strokeWidth={2.6 * u} />
            <animateMotion dur="14s" begin="1.2s" repeatCount="indefinite" path={geo.d} />
          </g>
        )}
      </svg>

      {zoomable && fit === "auto" && geo && (
        <button
          type="button"
          onClick={() => setMode(active === "route" ? "full" : "route")}
          className="absolute bottom-2.5 right-2.5 rounded-lg border border-line bg-surface/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur transition-colors hover:border-brand-500"
        >
          {active === "route" ? "Show full map" : "Zoom to route"}
        </button>
      )}
    </div>
  );
}
