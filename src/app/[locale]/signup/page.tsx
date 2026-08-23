import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { SignupForm } from "@/components/SignupForm";

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const { role } = await searchParams;
  const dict = await getDictionary(locale);
  const initialRole = role === "HELPER" ? "HELPER" : "REQUESTER";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{dict.auth.signupTitle}</h1>
      <SignupForm locale={locale} dict={dict} initialRole={initialRole} />
      <p>
        {dict.auth.haveAccount}{" "}
        <Link href={`/${locale}/login`} className="font-semibold text-accent underline">
          {dict.nav.login}
        </Link>
      </p>
    </div>
  );
}
