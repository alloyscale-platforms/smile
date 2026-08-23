import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { prisma } from "@/lib/db";
import { updatePage } from "@/server/actions/admin";

const KNOWN_SLUGS = ["home", "how-it-works", "faq"];

export default async function AdminEditPagePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const page = await prisma.page.findUnique({ where: { slug } });

  const save = async (formData: FormData) => {
    "use server";
    await updatePage(locale, slug, formData);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {KNOWN_SLUGS.map((s) => (
          <Link
            key={s}
            href={`/${locale}/admin/pages/${s}`}
            className={`rounded-full border border-border px-3 py-1.5 text-sm font-semibold ${
              s === slug ? "bg-accent text-accent-foreground" : ""
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <form action={save} className="flex max-w-2xl flex-col gap-4">
        <h2 className="text-xl font-bold">
          {dict.admin.editPage}: {slug}
        </h2>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{dict.admin.pageTitleEn}</span>
          <input
            name="titleEn"
            defaultValue={page?.titleEn ?? ""}
            className="rounded-lg border border-border p-3"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{dict.admin.pageTitleVi}</span>
          <input
            name="titleVi"
            defaultValue={page?.titleVi ?? ""}
            className="rounded-lg border border-border p-3"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{dict.admin.pageBodyEn}</span>
          <textarea
            name="bodyEn"
            rows={6}
            defaultValue={page?.bodyEn ?? ""}
            className="rounded-lg border border-border p-3"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{dict.admin.pageBodyVi}</span>
          <textarea
            name="bodyVi"
            rows={6}
            defaultValue={page?.bodyVi ?? ""}
            className="rounded-lg border border-border p-3"
          />
        </label>
        <button
          type="submit"
          className="self-start rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground"
        >
          {dict.common.save}
        </button>
      </form>
    </div>
  );
}
