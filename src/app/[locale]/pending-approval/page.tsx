import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { requireUser } from "@/lib/dal";

export default async function PendingApprovalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const user = await requireUser(locale);

  if (user.status === "ACTIVE") {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
      <h1 className="text-2xl font-bold">{dict.auth.pendingTitle}</h1>
      <p className="leading-relaxed">{dict.auth.pendingBody}</p>
    </div>
  );
}
