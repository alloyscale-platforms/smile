// Plain string unions instead of Prisma enums so the schema works unchanged
// on SQLite (dev) and Postgres (pilot) — see prisma/schema.prisma.

export const ROLES = ["ADMIN", "HELPER", "REQUESTER"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const URGENCIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type Urgency = (typeof URGENCIES)[number];

export const REQUEST_STATUSES = [
  "OPEN",
  "CLAIMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Which status a request may move to next, keyed by its current status. */
export const REQUEST_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  OPEN: [],
  CLAIMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const DEFAULT_CATEGORIES = [
  { slug: "translation", icon: "🗣️", sortOrder: 0 },
  { slug: "tech-setup", icon: "📱", sortOrder: 1 },
  { slug: "transportation", icon: "🚗", sortOrder: 2 },
  { slug: "groceries", icon: "🛒", sortOrder: 3 },
  { slug: "companionship", icon: "☕", sortOrder: 4 },
  { slug: "paperwork", icon: "📄", sortOrder: 5 },
  { slug: "medical-accompaniment", icon: "🩺", sortOrder: 6 },
  { slug: "home-help", icon: "🔧", sortOrder: 7 },
  { slug: "other", icon: "✨", sortOrder: 8 },
] as const;

/** camelCase key into the "categories" dictionary namespace for a category slug. */
export function categoryDictKey(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
