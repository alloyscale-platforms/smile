import "server-only";
import { prisma } from "@/lib/db";
import { consoleChannel } from "./console";
import { emailChannel } from "./email";
import { viberChannel } from "./viber";
import type { NotificationEvent } from "./types";

const channels = [consoleChannel, emailChannel, viberChannel];

/** Fans an event out to every channel and records one NotificationLog row per attempt. */
export async function dispatchNotification(event: NotificationEvent) {
  const payload = JSON.stringify(event.data);

  await Promise.all(
    channels.map(async (channel) => {
      let result;
      try {
        result = await channel.send(event);
      } catch (err) {
        result = { status: "FAILED" as const, detail: (err as Error).message };
      }

      await prisma.notificationLog.create({
        data: {
          event: event.name,
          channel: channel.name,
          payload,
          status: result.status,
          detail: result.detail,
        },
      });
    }),
  );
}
