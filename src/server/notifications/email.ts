import type { NotificationChannel, NotificationEvent, NotificationResult } from "./types";

/**
 * No-ops (SKIPPED) until SMTP_* env vars are configured, so the pilot works
 * with zero email setup. Wire up a real transport (e.g. nodemailer) here once
 * you have SMTP credentials — the interface won't need to change.
 */
export const emailChannel: NotificationChannel = {
  name: "email",
  async send(event: NotificationEvent): Promise<NotificationResult> {
    if (!process.env.SMTP_HOST) {
      return { status: "SKIPPED", detail: "SMTP_HOST is not configured" };
    }

    // TODO: send via SMTP once credentials are available.
    console.log(`[email:would-send] ${event.summary}`, event.data);
    return { status: "SKIPPED", detail: "Email sending not yet implemented" };
  },
};
