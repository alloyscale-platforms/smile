import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { prisma } from "@/lib/db";
import { sendTestViberNotification } from "@/server/actions/admin";

const STATUS_STYLES: Record<string, string> = {
  SENT: "bg-emerald-100 text-emerald-800",
  SKIPPED: "bg-gray-200 text-gray-700",
  FAILED: "bg-red-100 text-red-800",
};

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const logs = await prisma.notificationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const sendTest = async () => {
    "use server";
    await sendTestViberNotification(locale);
  };

  return (
    <div className="flex flex-col gap-6">
      <form action={sendTest}>
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground"
        >
          {dict.admin.sendTestViber}
        </button>
      </form>

      {logs.length === 0 ? (
        <p className="opacity-80">{dict.admin.noNotifications}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{log.event}</span>
                <span className="opacity-70">via {log.channel}</span>
                <span
                  className={`ml-auto rounded-full px-3 py-1 font-semibold ${STATUS_STYLES[log.status] ?? ""}`}
                >
                  {log.status}
                </span>
              </div>
              {log.detail && <p className="opacity-80">{log.detail}</p>}
              <pre className="overflow-x-auto rounded-lg bg-black/5 p-2 text-xs">
                {log.payload}
              </pre>
              <span className="opacity-60">{log.createdAt.toLocaleString(locale)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
