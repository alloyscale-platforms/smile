import Link from "next/link";
import type { HelpRequestGetPayload } from "@/generated/prisma/models";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { categoryDictKey } from "@/lib/constants";
import type { RequestStatus, Urgency } from "@/lib/constants";
import { StatusBadge, UrgencyBadge } from "./StatusBadge";

export type RequestCardData = HelpRequestGetPayload<{
  include: { category: true; requester: true; claimedBy: true };
}>;

export function RequestCard({
  request,
  locale,
  dict,
}: {
  request: RequestCardData;
  locale: Locale;
  dict: Dictionary;
}) {
  const categoryKey = categoryDictKey(request.category.slug) as keyof typeof dict.categories;
  const categoryLabel =
    dict.categories[categoryKey] ??
    (locale === "en" ? request.category.labelEn : request.category.labelVi);

  return (
    <Link
      href={`/${locale}/requests/${request.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-warm-sm transition-warm hover:-translate-y-1 hover:border-accent hover:shadow-warm-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl" aria-hidden>
          {request.category.icon}
        </span>
        <span className="font-semibold">{categoryLabel}</span>
        <div className="ml-auto flex gap-2">
          <UrgencyBadge urgency={request.urgency as Urgency} dict={dict} />
          <StatusBadge status={request.status as RequestStatus} dict={dict} />
        </div>
      </div>
      <h3 className="text-lg font-bold">{request.title}</h3>
      <p className="line-clamp-2 leading-relaxed opacity-90">{request.description}</p>
      <p className="text-sm opacity-70">
        {dict.requests.postedBy} {request.requester.name}
        {request.neighborhood ? ` · ${request.neighborhood}` : ""}
        {request.preferredWhen ? ` · ${request.preferredWhen}` : ""}
      </p>
    </Link>
  );
}
