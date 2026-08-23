import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { prisma } from "@/lib/db";
import { createCategory, setCategoryActive } from "@/server/actions/admin";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const categories = await prisma.helpCategory.findMany({ orderBy: { sortOrder: "asc" } });

  const addCategory = async (formData: FormData) => {
    "use server";
    await createCategory(locale, formData);
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">{dict.admin.categories}</h2>
        <ul className="flex flex-col gap-2">
          {categories.map((c) => {
            const toggle = async () => {
              "use server";
              await setCategoryActive(locale, c.id, !c.active);
            };
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
              >
                <span className="text-2xl" aria-hidden>
                  {c.icon}
                </span>
                <span className="font-semibold">{c.labelEn}</span>
                <span className="opacity-70">/ {c.labelVi}</span>
                <form action={toggle} className="ml-auto">
                  <button type="submit" className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold">
                    {c.active ? "Active" : "Inactive"}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex max-w-md flex-col gap-3">
        <h2 className="text-xl font-bold">{dict.admin.addCategory}</h2>
        <form action={addCategory} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{dict.admin.categoryLabelEn}</span>
            <input name="labelEn" required className="rounded-lg border border-border p-3" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{dict.admin.categoryLabelVi}</span>
            <input name="labelVi" required className="rounded-lg border border-border p-3" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{dict.admin.categoryIcon}</span>
            <input name="icon" defaultValue="✨" className="rounded-lg border border-border p-3" />
          </label>
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground"
          >
            {dict.admin.addCategory}
          </button>
        </form>
      </section>
    </div>
  );
}
