// src/features/shipments/Timeline.jsx
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatDateTime, toDate } from "@/lib/format";

/** Vertical event history, newest first. The latest event carries a live pulse. */
export default function Timeline({ events = [] }) {
  const sorted = [...events].sort((a, b) => (toDate(b.at)?.getTime() ?? 0) - (toDate(a.at)?.getTime() ?? 0));

  if (!sorted.length) {
    return <p className="text-sm text-muted">No updates yet. Milestones will appear here as your cargo moves.</p>;
  }

  return (
    <ol className="relative">
      {sorted.map((ev, i) => {
        const latest = i === 0;
        return (
          <li key={`${ev.status}-${i}`} className="relative flex gap-4 pb-7 last:pb-0">
            {i < sorted.length - 1 && (
              <span aria-hidden="true" className="absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-px bg-line" />
            )}
            <span className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
              {latest && <span aria-hidden="true" className="absolute inset-0 rounded-full bg-brand-400/50 animate-ping" />}
              <span
                className={cn(
                  "relative flex h-6 w-6 items-center justify-center rounded-full border-2",
                  latest ? "border-brand-500 bg-brand-500 text-graphite-950" : "border-line bg-surface text-muted"
                )}
              >
                {latest ? <Icon name="check" size={12} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-muted/60" />}
              </span>
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-semibold", latest ? "text-ink" : "text-ink/90")}>{ev.label}</p>
              <p className="mt-0.5 text-xs text-muted">
                {ev.location ? `${ev.location} · ` : ""}
                {formatDateTime(ev.at)}
              </p>
              {ev.note && <p className="mt-1.5 text-sm text-muted">{ev.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
