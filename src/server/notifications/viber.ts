import type { NotificationChannel, NotificationEvent, NotificationResult } from "./types";

const VIBER_SEND_MESSAGE_URL = "https://chatapi.viber.com/pa/send_message";

/**
 * Stub channel for the helpers' Viber group. Until VIBER_BOT_TOKEN and
 * VIBER_GROUP_ID are set, this just logs the exact payload it *would* POST to
 * the Viber Bot REST API (https://developers.viber.com/docs/api/rest-bot-api/),
 * so the shape can be verified from the admin notification log before a real
 * Public Account / bot is registered. Once you have a token, replace the
 * early return with a real `fetch(VIBER_SEND_MESSAGE_URL, ...)` call — the
 * NotificationChannel interface won't need to change.
 */
export const viberChannel: NotificationChannel = {
  name: "viber",
  async send(event: NotificationEvent): Promise<NotificationResult> {
    const token = process.env.VIBER_BOT_TOKEN;
    const groupId = process.env.VIBER_GROUP_ID;

    const payload = {
      receiver: groupId ?? "<VIBER_GROUP_ID not set>",
      type: "text",
      text: event.summary,
      sender: { name: "Smile" },
    };

    if (!token || !groupId) {
      console.log(`[viber:would-post] ${VIBER_SEND_MESSAGE_URL}`, payload);
      return {
        status: "SKIPPED",
        detail: "VIBER_BOT_TOKEN / VIBER_GROUP_ID not configured",
      };
    }

    try {
      const res = await fetch(VIBER_SEND_MESSAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Viber-Auth-Token": token,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return { status: "FAILED", detail: `Viber API responded ${res.status}` };
      }
      return { status: "SENT" };
    } catch (err) {
      return { status: "FAILED", detail: (err as Error).message };
    }
  },
};
