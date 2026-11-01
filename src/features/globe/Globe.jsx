// src/features/globe/Globe.jsx
"use client";

import { useEffect, useRef } from "react";
import { GLOBE_LAND } from "@/features/globe/globeData";
import { ports } from "@/config/logistics";
import { findRoute } from "@/features/map/routing";
import { densify, cumulative } from "@/features/map/geo";

const RAD = Math.PI / 180;

/** Globe colours. The light globe is cream with graphite land; the dark one is graphite with gold land. */
const PALETTES = {
  dark: {
    glow0: "rgba(255,198,26,0.30)", glow1: "rgba(255,198,26,0)",
    ocean: ["#4a4535", "#24221b", "#0b0a08"],
    grat: "rgba(255,255,255,0.09)",
    landFill: "rgba(255,206,77,0.30)", landStroke: "rgba(255,226,140,0.62)",
    route: "rgba(255,255,255,0.2)",
    portKey: "#ffffff", portDim: "rgba(255,255,255,0.65)", portStroke: null,
    pulse: "255,198,26", trail: "255,198,26", shadow: "rgba(255,198,26,0.95)",
    hull: "#ffffff", boxes: ["#ffc61a", "#f7f6f2", "#e4572e"], bridge: "#f7f6f2",
    limb: "rgba(255,214,102,0.6)", spec: "rgba(255,255,255,0.18)",
  },
  light: {
    glow0: "rgba(245,179,0,0.34)", glow1: "rgba(245,179,0,0)",
    ocean: ["#fffef6", "#ffeeaa", "#f0c957"],
    grat: "rgba(22,20,14,0.08)",
    landFill: "rgba(34,31,22,0.9)", landStroke: "rgba(22,20,14,1)",
    route: "rgba(22,20,14,0.3)",
    portKey: "#ffc61a", portDim: "rgba(255,198,26,0.95)", portStroke: "rgba(22,20,14,0.9)",
    pulse: "199,140,0", trail: "199,140,0", shadow: "rgba(245,179,0,0.9)",
    hull: "#2c2a23", boxes: ["#d99a00", "#e4572e", "#5a5649"], bridge: "#16140e",
    limb: "rgba(22,20,14,0.28)", spec: "rgba(255,255,255,0.6)",
  },
};

// Real sea routes with a ship on each. Pairs are port codes from config/logistics.js.
const ROUTES = [
  ["CNSHA", "NLRTM"], ["NLRTM", "USNYC"], ["USNYC", "USLAX"], ["SGSIN", "AEJEA"],
  ["GBFXT", "NGLOS"], ["BRSSZ", "ZACPT"], ["ZADUR", "KEMBA"], ["ESVLC", "BRSSZ"],
];

/** Pre-compute each route once: dense polyline, cumulative fractions and a pace. */
function buildRoutes() {
  return ROUTES.map(([a, b], i) => {
    const route = findRoute(a, b);
    if (!route) return null;
    const pts = densify(route.points, 140);
    const cum = cumulative(pts);
    const total = cum[cum.length - 1] || 1;
    return {
      pts,
      frac: cum.map((c) => c / total),
      period: 30 + (i % 4) * 5, // seconds for one crossing
      offset: i / ROUTES.length,
      ends: [a, b],
    };
  }).filter(Boolean);
}

/** Index of the last point at or before fraction t (binary search). */
function indexAt(frac, t) {
  let lo = 0;
  let hi = frac.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frac[mid] <= t) lo = mid;
    else hi = mid - 1;
  }
  return Math.min(lo, frac.length - 2);
}

function pointAt(route, t) {
  const i = indexAt(route.frac, t);
  const span = route.frac[i + 1] - route.frac[i] || 1;
  const f = (t - route.frac[i]) / span;
  const a = route.pts[i];
  const b = route.pts[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/**
 * Rotating globe with real coastlines and ships sailing real sea lanes between ports.
 * Drag (or swipe sideways) to spin it. Pauses off-screen and respects reduced motion.
 */
export default function Globe({ className, label = "Rotating globe with ships sailing between ports" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const routes = buildRoutes();
    const endpointCodes = new Set(routes.flatMap((r) => r.ends));

    // Follow the site theme toggle (data-theme on <html>)
    const root = document.documentElement;
    const pick = () => (root.dataset.theme === "dark" ? PALETTES.dark : PALETTES.light);
    let pal = pick();
    const themeObserver = new MutationObserver(() => {
      pal = pick();
      if (reduced) draw();
    });
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const state = { lng0: 12, lat0: 20, speed: 7, size: 0, dpr: 1, dragging: false, lastX: 0, lastY: 0, visible: true };
    let time = reduced ? 9 : 0;
    let raf = 0;
    let last = 0;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      state.size = Math.max(120, rect.width);
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(state.size * state.dpr);
      canvas.height = Math.round(state.size * state.dpr);
      canvas.style.width = `${state.size}px`;
      canvas.style.height = `${state.size}px`;
    }

    function draw() {
      const w = state.size;
      const cx = w / 2;
      const cy = w / 2;
      const r = w * 0.4;
      const s = w / 520; // scale for line widths and ship size
      const sp0 = Math.sin(state.lat0 * RAD);
      const cp0 = Math.cos(state.lat0 * RAD);

      /** [lng, lat] → [x, y, c] where c > 0 means the point faces us. */
      const proj = (lng, lat) => {
        const l = (lng - state.lng0) * RAD;
        const p = lat * RAD;
        const cp = Math.cos(p);
        const sp = Math.sin(p);
        const cl = Math.cos(l);
        return [cx + r * cp * Math.sin(l), cy - r * (cp0 * sp - sp0 * cp * cl), sp0 * sp + cp0 * cp * cl];
      };

      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      ctx.clearRect(0, 0, w, w);

      // Atmosphere glow
      const glow = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, r * 1.3);
      glow.addColorStop(0, pal.glow0);
      glow.addColorStop(1, pal.glow1);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Ocean
      const ocean = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.08, cx, cy, r * 1.05);
      ocean.addColorStop(0, pal.ocean[0]);
      ocean.addColorStop(0.55, pal.ocean[1]);
      ocean.addColorStop(1, pal.ocean[2]);
      ctx.fillStyle = ocean;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Graticule
      ctx.strokeStyle = pal.grat;
      ctx.lineWidth = 0.8;
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let pen = false;
        for (let lat = -80; lat <= 80; lat += 4) {
          const [x, y, c] = proj(lng, lat);
          if (c > 0) {
            if (pen) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
            pen = true;
          } else pen = false;
        }
        ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let pen = false;
        for (let lng = -180; lng <= 180; lng += 4) {
          const [x, y, c] = proj(lng, lat);
          if (c > 0) {
            if (pen) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
            pen = true;
          } else pen = false;
        }
        ctx.stroke();
      }

      // Land. Far-side points are pushed onto the horizon so partly-hidden coastlines close along the edge.
      ctx.fillStyle = pal.landFill;
      ctx.strokeStyle = pal.landStroke;
      ctx.lineWidth = 0.8;
      for (const ring of GLOBE_LAND) {
        let any = false;
        ctx.beginPath();
        for (let i = 0; i < ring.length; i += 2) {
          let [x, y, c] = proj(ring[i], ring[i + 1]);
          if (c > 0) any = true;
          else {
            const dx = x - cx;
            const dy = y - cy;
            const d = Math.hypot(dx, dy) || 1;
            x = cx + (dx / d) * r;
            y = cy + (dy / d) * r;
          }
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        if (!any) continue;
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Routes: faint full lane, then a glowing trail behind each ship
      for (const route of routes) {
        ctx.strokeStyle = pal.route;
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        let pen = false;
        for (const [lng, lat] of route.pts) {
          const [x, y, c] = proj(lng, lat);
          if (c > 0.03) {
            if (pen) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
            pen = true;
          } else pen = false;
        }
        ctx.stroke();
      }

      // Ports
      for (const p of ports) {
        const [x, y, c] = proj(p.lng, p.lat);
        if (c <= 0.05) continue;
        const key = endpointCodes.has(p.code);
        ctx.fillStyle = key ? pal.portKey : pal.portDim;
        ctx.beginPath();
        ctx.arc(x, y, (key ? 2.6 : 1.8) * s, 0, Math.PI * 2);
        ctx.fill();
        if (pal.portStroke) {
          ctx.strokeStyle = pal.portStroke;
          ctx.lineWidth = 0.9 * s;
          ctx.stroke();
        }
        if (key) {
          const phase = (time * 0.5 + (p.lng + 180) / 360) % 1;
          ctx.strokeStyle = `rgba(${pal.pulse},${0.6 * (1 - phase)})`;
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.arc(x, y, (3 + phase * 9) * s, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Ships
      for (const route of routes) {
        const t = (time / route.period + route.offset) % 1;
        const [lng, lat] = pointAt(route, t);
        const [x, y, c] = proj(lng, lat);
        if (c <= 0.08) continue;
        const fade = Math.min(1, t / 0.05, (1 - t) / 0.05);

        // Trail
        const steps = 10;
        const span = 0.16;
        let prev = null;
        for (let k = 0; k <= steps; k++) {
          const tt = t - span + (span * k) / steps;
          if (tt < 0) continue;
          const [tx, ty, tc] = proj(...pointAt(route, tt));
          if (prev && tc > 0.03) {
            ctx.strokeStyle = `rgba(${pal.trail},${(k / steps) * 0.95 * fade})`;
            ctx.lineWidth = 2.2 * s;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(prev[0], prev[1]);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
          prev = tc > 0.03 ? [tx, ty] : null;
        }

        // Ship glyph, facing its direction of travel
        const [nx, , nc] = proj(...pointAt(route, Math.min(1, t + 0.01)));
        const dir = nc > 0 && nx < x ? -1 : 1;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(dir * s * 1.25, s * 1.25);
        ctx.globalAlpha = fade;
        ctx.shadowColor = pal.shadow;
        ctx.shadowBlur = 8;
        ctx.fillStyle = pal.hull;
        ctx.beginPath(); // hull
        ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(5.5, 3.6); ctx.lineTo(-6.5, 3.6); ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        pal.boxes.forEach((col, k) => {
          ctx.fillStyle = col;
          ctx.fillRect(-6.2 + k * 3.3, -2.8, 3, 2.8);
        });
        ctx.fillStyle = pal.bridge; // bridge
        ctx.fillRect(4, -4.6, 2.6, 4.6);
        ctx.restore();
      }

      ctx.restore();

      // Edge light and highlight
      ctx.strokeStyle = pal.limb;
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      const spec = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.5, 0, cx - r * 0.45, cy - r * 0.5, r * 0.7);
      spec.addColorStop(0, pal.spec);
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      if (!state.visible) return;
      time += dt;
      if (!state.dragging) {
        state.lng0 += dt * state.speed;
        state.lat0 = 20 + 5 * Math.sin(time / 6);
      }
      draw();
    }

    function onDown(e) {
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
    }
    function onMove(e) {
      if (!state.dragging) return;
      const k = 120 / state.size; // degrees per pixel: roughly 1:1 with the surface at the centre
      state.lng0 -= (e.clientX - state.lastX) * k;
      state.lat0 = Math.max(-5, Math.min(55, state.lat0 + (e.clientY - state.lastY) * k * 0.6));
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      if (reduced) draw();
    }
    function onUp(e) {
      state.dragging = false;
      canvas.releasePointerCapture?.(e.pointerId);
    }

    resize();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
    });
    io.observe(wrap);

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    if (!reduced) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={wrapRef} className={className} role="img" aria-label={label}>
      <canvas ref={canvasRef} className="block cursor-grab touch-pan-y active:cursor-grabbing" />
    </div>
  );
}