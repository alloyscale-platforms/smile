import Link from "next/link";
import { marked } from "marked";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { categoryDictKey } from "@/lib/constants";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const [categories, homePage] = await Promise.all([
    prisma.helpCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.page.findUnique({ where: { slug: "home" } }),
  ]);

  // Page content is admin-authored only (see /admin/pages), never end-user
  // input, so rendering the parsed markdown as HTML here is safe.
  const homeBodyHtml = homePage
    ? marked.parse(locale === "en" ? homePage.bodyEn : homePage.bodyVi, { async: false })
    : null;

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-6">
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          {dict.home.heroTitle}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed">{dict.home.heroSubtitle}</p>
        {homeBodyHtml && (
          <div
            className="max-w-2xl rounded-2xl border border-border bg-surface p-4 leading-relaxed [&_a]:underline [&_a]:text-accent [&_p+p]:mt-3"
            dangerouslySetInnerHTML={{ __html: homeBodyHtml }}
          />
        )}
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/${locale}/signup?role=REQUESTER`}
            className="rounded-full bg-accent px-8 py-4 text-lg font-semibold text-accent-foreground"
          >
            {dict.home.ctaNeedHelp}
          </Link>
          <Link
            href={`/${locale}/signup?role=HELPER`}
            className="rounded-full border-2 border-accent px-8 py-4 text-lg font-semibold text-accent"
          >
            {dict.home.ctaWantToHelp}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">{dict.home.howItWorksTitle}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            [dict.home.step1Title, dict.home.step1Body],
            [dict.home.step2Title, dict.home.step2Body],
            [dict.home.step3Title, dict.home.step3Body],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="mb-2 text-lg font-bold">{title}</h3>
              <p className="leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">{dict.home.categoriesTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const key = categoryDictKey(category.slug) as keyof typeof dict.categories;
            const label = dict.categories[key] ?? (locale === "en" ? category.labelEn : category.labelVi);
            const descKey = `${key}Desc` as keyof typeof dict.categories;
            const description = dict.categories[descKey];
            return (
              <div
                key={category.id}
                className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5"
              >
                <span className="text-3xl" aria-hidden>
                  {category.icon}
                </span>
                <div>
                  <p className="font-semibold">{label}</p>
                  {description && <p className="text-sm opacity-80">{description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-2 text-xl font-bold">{dict.home.trustTitle}</h2>
        <p className="leading-relaxed">{dict.home.trustBody}</p>
      </section>
    </div>
  );
}
