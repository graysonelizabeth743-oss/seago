/**
 * Three layers of slowly drifting water. Each SVG is twice the container width and
 * contains two identical wavelengths, so translating by -50% loops seamlessly.
 * The front layer is filled with the page canvas colour so the hero melts into the next section.
 */
const PATH = "M0 60 C120 0 240 0 360 60 S600 120 720 60 S960 0 1080 60 S1320 120 1440 60 V140 H0 Z";

function Layer({ className, fill, opacity, height }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden" style={{ height }} aria-hidden="true">
      <svg className={`absolute bottom-0 left-0 h-full w-[200%] ${className}`} viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path d={PATH} fill={fill} opacity={opacity} />
      </svg>
    </div>
  );
}

export default function Waves({ fill = "var(--c-canvas)" }) {
  return (
    <>
      <Layer className="wave-a" fill="#3fa0dc" opacity="0.22" height="9rem" />
      <Layer className="wave-b" fill="#74beea" opacity="0.18" height="7rem" />
      <Layer className="wave-c" fill={fill} opacity="1" height="4.5rem" />
    </>
  );
}
