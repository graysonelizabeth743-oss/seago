import Link from "next/link";
import Icon from "@/components/ui/Icon";
import StatusBadge from "@/features/shipments/StatusBadge";
import { formatDate } from "@/lib/format";

/** Responsive list: stacked rows on phones, columns from `md` up. */
export default function ShipmentList({ shipments, hrefBase, showCustomer = false }) {
  return (
    <ul className="divide-y divide-line">
      {shipments.map((s) => (
        <li key={s.id}>
          <Link
            href={`${hrefBase}/${s.id}`}
            className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 px-4 py-4 transition-colors hover:bg-soft sm:px-6 md:grid-cols-[1.1fr_1.6fr_1fr_6rem_1.25rem]"
          >
            <span className="min-w-0">
              <span className="block truncate font-mono text-sm font-bold">{s.bookingNumber}</span>
              <span className="block truncate text-xs text-muted">
                {s.kind === "cargo" ? "Cargo" : "Package"}
                {showCustomer && (s.userName || s.userEmail) ? ` · ${s.userName || s.userEmail}` : ""}
              </span>
            </span>
            <span className="order-last col-span-2 truncate text-sm text-muted md:order-none md:col-span-1">
              {s.origin?.name} <span aria-hidden="true">→</span> <span className="sr-only">to</span> {s.destination?.name}
            </span>
            <span className="justify-self-end md:justify-self-start">
              <StatusBadge status={s.status} />
            </span>
            <span className="hidden text-xs text-muted md:block">{formatDate(s.createdAt)}</span>
            <Icon name="chevronRight" size={18} className="hidden text-muted transition-transform group-hover:translate-x-0.5 md:block" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
