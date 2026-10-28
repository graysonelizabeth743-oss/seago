import { Badge } from "@/components/ui/feedback";
import { statusMeta } from "@/features/shipments/statuses";

export default function StatusBadge({ status, className }) {
  const meta = statusMeta(status);
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}
