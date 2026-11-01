// src/components/ui/Waves.jsx
/**
 * Three layers of slowly drifting water. Each SVG is twice the container width and
 * contains two identical wavelengths, so translating by -50% loops seamlessly.
 * The front layer is filled with the page canvas colour so the hero melts into the next section.
 * `children` render between the middle and front layers (used for ships).
 */
const PATH = "M0 60 C120 0 240 0 360 60 S600 120 720 60 S960 0 1080 60 S1320 120 1440 60 V140 H0 Z";

function Layer({ className, fill, opacity, height, pathClass }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden" style={{ height }} aria-hidden="true">
      <svg className={`absolute bottom-0 left-0 h-full w-[200%] ${className}`} viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path d={PATH} fill={fill} opacity={pathClass ? undefined : opacity} className={pathClass} />
      </svg>
    </div>
  );
}

export default function Waves({ fill = "var(--c-canvas)", forceDark = false, children }) {
  return (
    <>
      <Layer className="wave-a" fill="#f5b300" height="9rem" pathClass={forceDark ? "opacity-[0.16]" : "opacity-35 dark:opacity-[0.16]"} />
      <Layer className="wave-b" fill="#ffd84d" height="7rem" pathClass={forceDark ? "opacity-[0.1]" : "opacity-45 dark:opacity-[0.1]"} />
      {children}
      <Layer className="wave-c" fill={fill} opacity="1" height="4.5rem" />
    </>
  );
}