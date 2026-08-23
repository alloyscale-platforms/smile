import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { requireActiveUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { RequestCard } from "@/components/RequestCard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const user = await requireActiveUser(locale);

  const include = { category: true, requester: true, claimedBy: true } as const;

  const [myRequests, myClaims] = await Promise.all([
    user.role === "HELPER"
      ? Promise.resolve([])
      : prisma.helpRequest.findMany({
          where: { requesterId: user.id },
          include,
          orderBy: { createdAt: "desc" },
        }),
    user.role === "REQUESTER"
      ? Promise.resolve([])
      : prisma.helpRequest.findMany({
          where: { claimedById: user.id },
          include,
          orderBy: { createdAt: "desc" },
        }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-3xl font-bold">
        {dict.dashboard.welcomeBack.replace("{name}", user.name)}
      </h1>

      {user.role !== "HELPER" && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{dict.requests.myRequests}</h2>
            <Link
              href={`/${locale}/requests/new`}
              className="rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-foreground"
            >
              {dict.dashboard.postNewRequest}
            </Link>
          </div>
          {myRequests.length === 0 ? (
            <p className="opacity-80">{dict.dashboard.requesterEmptyState}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myRequests.map((r) => (
                <RequestCard key={r.id} request={r} locale={locale} dict={dict} />
              ))}
            </div>
          )}
        </section>
      )}

      {user.role !== "REQUESTER" && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{dict.requests.myClaims}</h2>
            <Link
              href={`/${locale}/requests`}
              className="rounded-full border-2 border-accent px-5 py-2.5 font-semibold text-accent"
            >
              {dict.dashboard.browseOpenRequests}
            </Link>
          </div>
          {myClaims.length === 0 ? (
            <p className="opacity-80">{dict.dashboard.helperEmptyState}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myClaims.map((r) => (
                <RequestCard key={r.id} request={r} locale={locale} dict={dict} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
