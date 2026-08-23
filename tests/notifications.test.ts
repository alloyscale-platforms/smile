import { afterEach, describe, expect, it, vi } from "vitest";
import { consoleChannel } from "@/server/notifications/console";
import { emailChannel } from "@/server/notifications/email";
import { viberChannel } from "@/server/notifications/viber";
import type { NotificationEvent } from "@/server/notifications/types";

const event: NotificationEvent = {
  name: "TEST",
  summary: "A test notification",
  data: { foo: "bar" },
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("consoleChannel", () => {
  it("always sends", async () => {
    const result = await consoleChannel.send(event);
    expect(result.status).toBe("SENT");
  });
});

describe("emailChannel", () => {
  it("skips when SMTP_HOST is not configured", async () => {
    vi.stubEnv("SMTP_HOST", "");
    const result = await emailChannel.send(event);
    expect(result.status).toBe("SKIPPED");
  });
});

describe("viberChannel", () => {
  it("skips and reports the payload it would have sent when unconfigured", async () => {
    vi.stubEnv("VIBER_BOT_TOKEN", "");
    vi.stubEnv("VIBER_GROUP_ID", "");
    const result = await viberChannel.send(event);
    expect(result.status).toBe("SKIPPED");
    expect(result.detail).toMatch(/VIBER_BOT_TOKEN/);
  });

  it("attempts a real POST once a token and group id are configured", async () => {
    vi.stubEnv("VIBER_BOT_TOKEN", "test-token");
    vi.stubEnv("VIBER_GROUP_ID", "test-group");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await viberChannel.send(event);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://chatapi.viber.com/pa/send_message",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.status).toBe("SENT");
  });
});
