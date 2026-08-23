"use client";

import type { HelpCategory } from "@/generated/prisma/client";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { categoryDictKey } from "@/lib/constants";

export function CategoryIconGrid({
  categories,
  locale,
  dict,
  defaultValue,
}: {
  categories: HelpCategory[];
  locale: Locale;
  dict: Dictionary;
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {categories.map((category) => {
        const key = categoryDictKey(category.slug) as keyof typeof dict.categories;
        const label =
          dict.categories[key] ?? (locale === "en" ? category.labelEn : category.labelVi);
        return (
          <label
            key={category.id}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface p-4 has-[:checked]:border-accent has-[:checked]:bg-accent/10"
          >
            <input
              type="radio"
              name="categoryId"
              value={category.id}
              required
              defaultChecked={defaultValue === category.id}
              className="h-5 w-5"
            />
            <span className="text-2xl" aria-hidden>
              {category.icon}
            </span>
            <span className="font-semibold">{label}</span>
          </label>
        );
      })}
    </div>
  );
}
