// Decorative life for the home hero: twinkling stars, drifting gulls and ships sailing across the waves.
// Everything is pure CSS/SVG (see globals.css) and hidden from assistive tech.

const STARS = [
  [6, 12, 0], [14, 28, 1.2], [22, 8, 2.1], [31, 20, 0.6], [38, 6, 1.7], [47, 16, 2.6], [55, 9, 0.3],
  [63, 24, 1.9], [71, 7, 1.1], [79, 18, 2.4], [86, 10, 0.8], [93, 26, 1.5], [10, 40, 2.8], [27, 36, 0.9],
  [44, 33, 2.2], [68, 38, 0.4], [90, 44, 1.8], [58, 46, 2.9],
];

export function Stars() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      {STARS.map(([x, y, d], i) => (
        <span key={i} className="twinkle absolute h-[3px] w-[3px] rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

function Gull({ className, style }) {
  return (
    <div className={`gull absolute ${className}`} style={style}>
      <svg viewBox="0 0 28 10" width="28" height="10" className="flap" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M1 7 Q7 0 14 6 Q21 0 27 7" />
      </svg>
    </div>
  );
}

export function Gulls() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Gull className="bottom-[9.5rem]" style={{ "--dur": "48s", "--delay": "-6s" }} />
      <Gull className="bottom-[11.5rem] scale-75" style={{ "--dur": "62s", "--delay": "-30s" }} />
      <Gull className="bottom-[10.5rem] scale-90" style={{ "--dur": "55s", "--delay": "-18s" }} />
    </div>
  );
}

function CargoShip() {
  const boxes = [
    ["#ffb454", "#5eead4", "#f87171", "#74beea", "#a78bfa", "#ffb454"],
    ["#5eead4", "#74beea", "#ffb454", "#f87171", "#5eead4", "#74beea"],
  ];
  return (
    <svg viewBox="0 0 170 70" width="150" height="62" className="bobship">
      {boxes.map((row, r) =>
        row.map((c, i) => <rect key={`${r}-${i}`} x={14 + i * 17} y={24 - r * 11} width="15" height="10" rx="1.5" fill={c} />)
      )}
      <rect x="120" y="8" width="22" height="26" rx="2" fill="#f4fafd" />
      <rect x="124" y="13" width="14" height="4" rx="1" fill="#74beea" />
      <rect x="124" y="20" width="14" height="4" rx="1" fill="#74beea" />
      <path d="M4 34 H158 L146 56 H18 Z" fill="#0d3a5f" />
      <path d="M8 40 H154 L150 46 H12 Z" fill="#3fa0dc" />
    </svg>
  );
}

function Sailboat() {
  return (
    <svg viewBox="0 0 60 60" width="46" height="46" className="bobship">
      <path d="M30 6 L30 40 L10 40 Z" fill="#f4fafd" />
      <path d="M33 14 L33 40 L50 40 Z" fill="#74beea" />
      <path d="M6 42 H54 L47 54 H13 Z" fill="#0d3a5f" />
    </svg>
  );
}

/** Rendered between the middle and front waves so ships sit "in" the water. */
export function Ships() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[3.1rem] h-24 overflow-hidden" aria-hidden="true">
      <div className="ship" style={{ "--dur": "68s", "--delay": "-12s" }}><CargoShip /></div>
      <div className="ship ship-rev" style={{ "--dur": "92s", "--delay": "-50s" }}><div className="scale-[0.7]"><CargoShip /></div></div>
      <div className="ship" style={{ "--dur": "54s", "--delay": "-34s" }}><Sailboat /></div>
    </div>
  );
}
