import type { NotificationChannel, NotificationEvent, NotificationResult } from "./types";

/** Always-on channel: logs to the server console. Good enough for a small pilot. */
export const consoleChannel: NotificationChannel = {
  name: "console",
  async send(event: NotificationEvent): Promise<NotificationResult> {
    console.log(`[notify:${event.name}] ${event.summary}`, event.data);
    return { status: "SENT" };
  },
};
