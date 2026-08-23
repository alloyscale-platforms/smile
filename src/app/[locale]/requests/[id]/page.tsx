import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { requireActiveUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { categoryDictKey, type RequestStatus, type Urgency } from "@/lib/constants";
import { StatusBadge, UrgencyBadge } from "@/components/StatusBadge";
import { MessageForm } from "@/components/MessageForm";
import { claimRequest, updateRequestStatus } from "@/server/actions/requests";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const user = await requireActiveUser(locale);

  const request = await prisma.helpRequest.findUnique({
    where: { id },
    include: {
      category: true,
      requester: true,
      claimedBy: true,
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!request) notFound();

  const isRequester = request.requesterId === user.id;
  const isClaimer = request.claimedById === user.id;
  const isAdmin = user.role === "ADMIN";
  const isParticipant = isRequester || isClaimer || isAdmin;
  const canClaim = request.status === "OPEN" && (user.role === "HELPER" || isAdmin);

  const categoryKey = categoryDictKey(request.category.slug) as keyof typeof dict.categories;
  const categoryLabel =
    dict.categories[categoryKey] ??
    (locale === "en" ? request.category.labelEn : request.category.labelVi);

  const claim = claimRequest.bind(null, locale, request.id);
  const markInProgress = updateRequestStatus.bind(null, locale, request.id, "IN_PROGRESS");
  const markCompleted = updateRequestStatus.bind(null, locale, request.id, "COMPLETED");
  const markCancelled = updateRequestStatus.bind(null, locale, request.id, "CANCELLED");

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {request.category.icon}
        </span>
        <span className="font-semibold">{categoryLabel}</span>
        <div className="ml-auto flex gap-2">
          <UrgencyBadge urgency={request.urgency as Urgency} dict={dict} />
          <StatusBadge status={request.status as RequestStatus} dict={dict} />
        </div>
      </div>

      <h1 className="text-3xl font-bold">{request.title}</h1>
      <p className="leading-relaxed">{request.description}</p>

      <dl className="grid grid-cols-2 gap-2 text-sm opacity-80">
        <dt className="font-semibold">{dict.requests.postedBy}</dt>
        <dd>{request.requester.name}</dd>
        {request.preferredWhen && (
          <>
            <dt className="font-semibold">{dict.requests.preferredWhenLabel}</dt>
            <dd>{request.preferredWhen}</dd>
          </>
        )}
        {request.neighborhood && (
          <>
            <dt className="font-semibold">{dict.requests.neighborhoodLabel}</dt>
            <dd>{request.neighborhood}</dd>
          </>
        )}
        {request.claimedBy && (
          <>
            <dt className="font-semibold">{dict.requests.claimedByLabel}</dt>
            <dd>{request.claimedBy.name}</dd>
          </>
        )}
      </dl>

      <div className="flex flex-wrap gap-3">
        {canClaim && (
          <form action={claim}>
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground"
            >
              {dict.requests.claimButton}
            </button>
          </form>
        )}
        {isParticipant && request.status === "CLAIMED" && (
          <>
            <form action={markInProgress}>
              <button type="submit" className="rounded-full border border-border px-5 py-2.5 font-semibold">
                {dict.requests.markInProgress}
              </button>
            </form>
            <form action={markCancelled}>
              <button type="submit" className="rounded-full border border-border px-5 py-2.5 font-semibold">
                {dict.requests.markCancelled}
              </button>
            </form>
          </>
        )}
        {isParticipant && request.status === "IN_PROGRESS" && (
          <>
            <form action={markCompleted}>
              <button type="submit" className="rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-foreground">
                {dict.requests.markCompleted}
              </button>
            </form>
            <form action={markCancelled}>
              <button type="submit" className="rounded-full border border-border px-5 py-2.5 font-semibold">
                {dict.requests.markCancelled}
              </button>
            </form>
          </>
        )}
      </div>

      {isParticipant && (
        <section className="flex flex-col gap-4 border-t border-border pt-6">
          <h2 className="text-xl font-bold">{dict.requests.messagesTitle}</h2>
          {request.messages.length === 0 ? (
            <p className="opacity-70">{dict.requests.noMessagesYet}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {request.messages.map((m) => (
                <li key={m.id} className="rounded-2xl border border-border bg-surface p-3">
                  <p className="text-sm font-semibold">{m.sender.name}</p>
                  <p>{m.body}</p>
                </li>
              ))}
            </ul>
          )}
          <MessageForm locale={locale} requestId={request.id} dict={dict} />
        </section>
      )}
    </div>
  );
}
