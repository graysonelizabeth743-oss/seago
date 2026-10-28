import Icon from "@/components/ui/Icon";

/** Native <details> accordion: accessible, keyboard friendly, no JavaScript. */
export default function Faq({ items }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-left font-display text-base font-bold marker:hidden [&::-webkit-details-marker]:hidden">
            {f.q}
            <Icon name="chevronDown" size={18} className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="max-w-3xl pb-5 pr-8 text-sm leading-relaxed text-muted sm:text-base">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
