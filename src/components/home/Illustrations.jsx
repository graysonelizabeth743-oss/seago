// Friendly illustrations for the "package or container" section. Decorative; they float gently.

export function GiftIllustration({ className }) {
  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden="true">
      <ellipse cx="120" cy="164" rx="70" ry="9" fill="currentColor" opacity="0.08" />
      <g className="bob">
        <rect x="62" y="82" width="116" height="78" rx="8" fill="#1583c8" />
        <rect x="62" y="82" width="116" height="78" rx="8" fill="url(#gshade)" />
        <rect x="52" y="64" width="136" height="26" rx="7" fill="#0a68a8" />
        <rect x="108" y="64" width="24" height="96" fill="#eaf6fd" />
        <path d="M120 64 C100 28 66 36 82 58 C90 68 112 66 120 64Z" fill="#74beea" />
        <path d="M120 64 C140 28 174 36 158 58 C150 68 128 66 120 64Z" fill="#a9d8f3" />
        <circle cx="120" cy="64" r="8" fill="#eaf6fd" />
      </g>
      <g fill="#5eead4">
        <path className="twinkle" d="M36 52 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
        <path className="twinkle" style={{ animationDelay: "1.2s" }} d="M200 40 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" />
        <path className="twinkle" style={{ animationDelay: "2.1s" }} d="M206 112 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
      </g>
      <defs>
        <linearGradient id="gshade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Box({ x, y, w = 78, h = 34, fill }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={fill} />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={x + 8 + i * 10} y={y + 4} width="3" height={h - 8} rx="1.5" fill="#000" opacity="0.14" />
      ))}
      <rect x={x} y={y} width={w} height={h} rx="3" fill="none" stroke="#000" strokeOpacity="0.16" />
    </g>
  );
}

export function ContainerIllustration({ className }) {
  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden="true">
      <ellipse cx="120" cy="164" rx="84" ry="9" fill="currentColor" opacity="0.08" />
      <g className="bob">
        <Box x={34} y={122} fill="#0a68a8" />
        <Box x={124} y={122} fill="#f59e0b" />
        <Box x={34} y={86} fill="#14b8c6" />
        <Box x={124} y={86} fill="#1583c8" />
        <Box x={79} y={50} fill="#ef6a5a" />
      </g>
      <g stroke="#5eead4" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path className="twinkle" d="M206 40 v10 M201 45 h10" />
        <path className="twinkle" style={{ animationDelay: "1.4s" }} d="M28 52 v8 M24 56 h8" />
      </g>
    </svg>
  );
}
