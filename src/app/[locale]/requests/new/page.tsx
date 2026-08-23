import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { requireActiveUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { NewRequestWizard } from "@/components/NewRequestWizard";

export default async function NewRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  await requireActiveUser(locale);

  const categories = await prisma.helpCategory.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{dict.requests.newTitle}</h1>
      <NewRequestWizard locale={locale} dict={dict} categories={categories} />
    </div>
  );
}
