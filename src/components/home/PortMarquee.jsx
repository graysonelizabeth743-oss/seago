// src/components/home/PortMarquee.jsx
import { ports } from "@/config/logistics";
import Icon from "@/components/ui/Icon";

/** Endless strip of the ports we serve. CSS-only; pauses on hover; the duplicate is hidden from assistive tech. */
function Row({ hidden = false }) {
  return (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
      {ports.map((p) => (
        <li key={p.code} className="flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold text-muted">
          <Icon name="anchor" size={14} className="text-brand-500" />
          <span className="text-ink">{p.name}</span>
          <span className="font-normal">{p.country}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PortMarquee() {
  return (
    <section aria-label="Ports we serve" className="marquee border-b border-line bg-canvas py-5">
      <div className="marquee-track flex w-max">
        <Row />
        <Row hidden />
      </div>
    </section>
  );
}
