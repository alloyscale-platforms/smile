import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{dict.auth.loginTitle}</h1>
      <LoginForm locale={locale} dict={dict} />
      <p>
        {dict.auth.noAccount}{" "}
        <Link href={`/${locale}/signup`} className="font-semibold text-accent underline">
          {dict.nav.signup}
        </Link>
      </p>
    </div>
  );
}
