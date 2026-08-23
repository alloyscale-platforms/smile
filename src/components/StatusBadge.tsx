import type { Dictionary } from "@/i18n/dictionaries";
import type { RequestStatus, Urgency } from "@/lib/constants";

const STATUS_STYLES: Record<RequestStatus, string> = {
  OPEN: "bg-accent-secondary/15 text-accent-secondary",
  CLAIMED: "bg-highlight/20 text-highlight-foreground",
  IN_PROGRESS: "bg-accent/15 text-accent",
  COMPLETED: "bg-foreground/10 text-foreground",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_KEYS: Record<RequestStatus, keyof Dictionary["requests"]> = {
  OPEN: "statusOpen",
  CLAIMED: "statusClaimed",
  IN_PROGRESS: "statusInProgress",
  COMPLETED: "statusCompleted",
  CANCELLED: "statusCancelled",
};

export function StatusBadge({ status, dict }: { status: RequestStatus; dict: Dictionary }) {
  return (
    <span
      className={`tint-panel rounded-full border border-transparent px-3 py-1 text-sm font-semibold ${STATUS_STYLES[status]}`}
    >
      {dict.requests[STATUS_KEYS[status]]}
    </span>
  );
}

export function UrgencyBadge({ urgency, dict }: { urgency: Urgency; dict: Dictionary }) {
  if (urgency !== "HIGH") return null;
  return (
    <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow-warm-sm">
      {dict.requests.urgent}
    </span>
  );
}
