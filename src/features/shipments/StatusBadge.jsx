import { Badge } from "@/components/ui/feedback";
import { statusMeta } from "@/features/shipments/statuses";
import { HOLD_LABEL } from "@/features/shipments/verification";

/** `hold` replaces the status with "On hold · awaiting verification" (see verification.js). */
export default function StatusBadge({ status, hold = false, className }) {
  if (hold) {
    return (
      <Badge tone="warning" className={className}>
        {HOLD_LABEL}
      </Badge>
    );
  }
  const meta = statusMeta(status);
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}
