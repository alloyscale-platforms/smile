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
  const contrast = cookieStore.get("contrast")?.value !== "normal";
  const logoutWithLocale = logout.bind(null, locale);

  const navLinks = (
    <>
      <Link className="hover:text-accent" href={`/${locale}/requests`}>
        {dict.nav.browseRequests}
      </Link>
      {user ? (
        <>
          <Link className="hover:text-accent" href={`/${locale}/dashboard`}>
            {dict.nav.dashboard}
          </Link>
          {user.role === "ADMIN" && (
            <Link className="hover:text-accent" href={`/${locale}/admin`}>
              {dict.nav.admin}
            </Link>
          )}
          <form action={logoutWithLocale}>
            <button type="submit" className="underline hover:text-accent">
              {dict.nav.logout}
            </button>
          </form>
        </>
      ) : (
        <>
          <Link className="hover:text-accent" href={`/${locale}/login`}>
            {dict.nav.login}
          </Link>
          <Link
            href={`/${locale}/signup`}
            className="rounded-full bg-accent px-4 py-2 text-center text-accent-foreground shadow-warm-sm hover:-translate-y-0.5 hover:shadow-warm-md"
          >
            {dict.nav.signup}
          </Link>
        </>
      )}
    </>
  );

  const controls = (
    <>
      <AccessibilityToggle
        initialTextSize={textSize}
        initialContrast={contrast}
        labels={{ textSize: dict.nav.textSize, highContrast: dict.nav.highContrast }}
      />
      <LocaleSwitcher locale={locale} />
    </>
  );

  return (
    <header className="relative border-b border-border bg-surface shadow-warm-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-extrabold text-accent">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-xl"
            aria-hidden
          >
            🙂
          </span>
          {dict.appName}
        </Link>

        {/* Desktop: everything inline. Hidden below sm, where it collapses into the menu below. */}
        <div className="hidden items-center gap-5 sm:flex">
          <nav className="flex flex-wrap items-center gap-5 text-base font-medium">{navLinks}</nav>
          <div className="flex items-center gap-3 border-l border-border pl-5">{controls}</div>
        </div>

        {/* Mobile: a single disclosure menu — no JS required. */}
        <details className="group sm:hidden">
          <summary
            aria-label={dict.nav.menu}
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-border text-xl [&::-webkit-details-marker]:hidden"
          >
            <span className="group-open:hidden" aria-hidden>
              ☰
            </span>
            <span className="hidden group-open:inline" aria-hidden>
              ✕
            </span>
          </summary>
          <div className="absolute right-4 z-20 mt-3 flex w-64 flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-warm-md">
            <nav className="flex flex-col gap-4 text-base font-medium">{navLinks}</nav>
            <div className="flex items-center gap-3 border-t border-border pt-4">{controls}</div>
          </div>
        </details>
      </div>
    </header>
  );
}
