import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { prisma } from "@/lib/db";
import { categoryDictKey, URGENCIES, type Urgency } from "@/lib/constants";
import { RequestCard } from "@/components/RequestCard";

export default async function BrowseRequestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; urgency?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const { category, urgency } = await searchParams;

  const categories = await prisma.helpCategory.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const requests = await prisma.helpRequest.findMany({
    where: {
      status: "OPEN",
      categoryId: category || undefined,
      urgency: urgency && URGENCIES.includes(urgency as Urgency) ? urgency : undefined,
    },
    include: { category: true, requester: true, claimedBy: true },
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{dict.requests.browseTitle}</h1>

      <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap" method="get">
        <select
          name="category"
          defaultValue={category ?? ""}
          className="w-full rounded-lg border border-border p-3 sm:w-auto"
        >
          <option value="">{dict.requests.filterAll}</option>
          {categories.map((c) => {
            const key = categoryDictKey(c.slug) as keyof typeof dict.categories;
            return (
              <option key={c.id} value={c.id}>
                {c.icon} {dict.categories[key] ?? (locale === "en" ? c.labelEn : c.labelVi)}
              </option>
            );
          })}
        </select>

        <select
          name="urgency"
          defaultValue={urgency ?? ""}
          className="w-full rounded-lg border border-border p-3 sm:w-auto"
        >
          <option value="">{dict.requests.filterUrgency}</option>
          <option value="HIGH">{dict.requests.urgencyHigh}</option>
          <option value="MEDIUM">{dict.requests.urgencyMedium}</option>
          <option value="LOW">{dict.requests.urgencyLow}</option>
        </select>

        <button
          type="submit"
          className="w-full rounded-lg border border-border px-4 py-3 font-semibold shadow-warm-sm hover:-translate-y-0.5 sm:w-auto"
        >
          {dict.common.submit}
        </button>
      </form>

      {requests.length === 0 ? (
        <p className="opacity-80">{dict.requests.noOpenRequests}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} locale={locale} dict={dict} />
          ))}
        </div>
      )}
    </div>
  );
}
