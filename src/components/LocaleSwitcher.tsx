"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/dictionaries";

const LABELS: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const other: Locale = locale === "en" ? "vi" : "en";
  const rest = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  return (
    <Link
      href={`/${other}${rest}`}
      className="rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      {LABELS[other]}
    </Link>
  );
}
