export type NotificationEventName = "REQUEST_CREATED" | "REQUEST_CLAIMED" | "TEST";

export type NotificationEvent = {
  name: NotificationEventName;
  /** Short human-readable summary, used by every channel as a fallback message. */
  summary: string;
  /** Arbitrary structured data a channel implementation may use to render a richer message. */
  data: Record<string, unknown>;
};

export type NotificationResult = {
  status: "SENT" | "FAILED" | "SKIPPED";
  detail?: string;
};

export interface NotificationChannel {
  name: string;
  send(event: NotificationEvent): Promise<NotificationResult>;
}
