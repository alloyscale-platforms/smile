import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { requireAdmin } from "@/lib/dal";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  await requireAdmin(locale);
  const dict = await getDictionary(locale);

  const tabs: [string, string][] = [
    [`/${locale}/admin`, dict.admin.overview],
    [`/${locale}/admin/users`, dict.admin.allUsers],
    [`/${locale}/admin/categories`, dict.admin.categories],
    [`/${locale}/admin/pages/home`, dict.admin.pages],
    [`/${locale}/admin/notifications`, dict.admin.notificationLog],
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{dict.admin.title}</h1>
      <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
