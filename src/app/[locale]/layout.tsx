import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary, hasLocale, locales } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/lib/dal";
import { Nav } from "@/components/Nav";
import "../globals.css";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Smile — neighbors helping neighbors",
  description:
    "Connecting older adults who need a hand with younger volunteers nearby.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const [dict, user, cookieStore] = await Promise.all([
    getDictionary(locale),
    getCurrentUser(),
    cookies(),
  ]);

  const textSize = cookieStore.get("text-size")?.value;
  const contrast = cookieStore.get("contrast")?.value === "high";

  return (
    <html
      lang={locale}
      data-text-size={textSize === "lg" || textSize === "xl" ? textSize : undefined}
      data-contrast={contrast ? "high" : undefined}
    >
      <body className="min-h-screen">
        <Nav locale={locale} dict={dict} user={user} />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-border px-4 py-8 text-center text-sm opacity-80">
          {dict.footer.tagline}
        </footer>
      </body>
    </html>
  );
}
