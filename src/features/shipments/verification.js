/**
 * Verification: every new booking (package or cargo) is placed ON HOLD until the Sea Go team has
 * inspected the real shipment and approved it for transport.
 *
 * Stored as shipment.verification = { state: "pending" | "approved" | "rejected", note, by, byName, at }.
 * The public tracking record only carries the state string.
 *
 * Shipments created before this feature have no `verification`: those still at "booked" count as
 * pending; everything else counts as approved.
 */

export function verificationState(s) {
  const v = s?.verification;
  const state = typeof v === "string" ? v : v?.state;
  if (state) return state;
  return s?.status === "booked" ? "pending" : "approved";
}

/** True while the shipment is waiting for the team to verify it. */
export function isOnHold(s) {
  return verificationState(s) === "pending" && s?.status !== "cancelled";
}

export const HOLD_LABEL = "On hold · awaiting verification";

export const HOLD_TITLE = "On hold while we verify it";

/** Shown to customers on the booking review, confirmation and shipment pages. */
export const HOLD_MESSAGE =
  "The Sea Go team will verify this shipment and inspect the actual package to confirm it matches what was declared. " +
  "Once it's cleared and approved for transport, its status will update here. We'll message you if we need anything.";

/** Checklist an admin must complete before approving. */
export const VERIFICATION_CHECKS = [
  "The actual package or cargo has been inspected",
  "The contents match what the customer declared",
  "Weight and size match the booking",
  "No prohibited or restricted items",
];
