import Link from "next/link";
import { cookies } from "next/headers";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import type { SessionUser } from "@/lib/dal";
import { logout } from "@/server/actions/auth";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { AccessibilityToggle } from "./AccessibilityToggle";

export async function Nav({
  locale,
  dict,
  user,
}: {
  locale: Locale;
  dict: Dictionary;
  user: SessionUser | null;
}) {
  const cookieStore = await cookies();
  const textSize = (cookieStore.get("text-size")?.value ?? "base") as "base" | "lg" | "xl";
  const contrast = cookieStore.get("contrast")?.value === "high";
  const logoutWithLocale = logout.bind(null, locale);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href={`/${locale}`} className="text-xl font-bold text-accent">
          🙂 {dict.appName}
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-base font-medium">
          <Link href={`/${locale}/requests`}>{dict.nav.browseRequests}</Link>
          {user ? (
            <>
              <Link href={`/${locale}/dashboard`}>{dict.nav.dashboard}</Link>
              {user.role === "ADMIN" && (
                <Link href={`/${locale}/admin`}>{dict.nav.admin}</Link>
              )}
              <form action={logoutWithLocale}>
                <button type="submit" className="underline">
                  {dict.nav.logout}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`}>{dict.nav.login}</Link>
              <Link
                href={`/${locale}/signup`}
                className="rounded-full bg-accent px-4 py-2 text-accent-foreground"
              >
                {dict.nav.signup}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <AccessibilityToggle
            initialTextSize={textSize}
            initialContrast={contrast}
            labels={{ textSize: dict.nav.textSize, highContrast: dict.nav.highContrast }}
          />
          <LocaleSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
