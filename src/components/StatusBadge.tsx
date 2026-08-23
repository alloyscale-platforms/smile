import type { Dictionary } from "@/i18n/dictionaries";
import type { RequestStatus, Urgency } from "@/lib/constants";

const STATUS_STYLES: Record<RequestStatus, string> = {
  OPEN: "bg-emerald-100 text-emerald-800",
  CLAIMED: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-gray-200 text-gray-700",
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
    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLES[status]}`}>
      {dict.requests[STATUS_KEYS[status]]}
    </span>
  );
}

export function UrgencyBadge({ urgency, dict }: { urgency: Urgency; dict: Dictionary }) {
  if (urgency !== "HIGH") return null;
  return (
    <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
      {dict.requests.urgent}
    </span>
  );
}
