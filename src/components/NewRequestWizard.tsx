"use client";

import { useActionState, useState } from "react";
import type { HelpCategory } from "@/generated/prisma/client";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { createRequest, type RequestFormState } from "@/server/actions/requests";
import { CategoryIconGrid } from "./CategoryIconGrid";
import { SubmitButton } from "./SubmitButton";

const STEPS = ["category", "details", "schedule", "review"] as const;

export function NewRequestWizard({
  locale,
  dict,
  categories,
}: {
  locale: Locale;
  dict: Dictionary;
  categories: HelpCategory[];
}) {
  const [step, setStep] = useState(0);
  const createWithLocale = createRequest.bind(null, locale);
  const [state, action] = useActionState<RequestFormState, FormData>(
    createWithLocale,
    undefined,
  );

  const stepTitles = [
    dict.requests.stepCategory,
    dict.requests.stepDetails,
    dict.requests.stepSchedule,
    dict.requests.stepReview,
  ];

  return (
    <form action={action} className="flex max-w-xl flex-col gap-6">
      <ol className="flex items-center">
        {stepTitles.map((title, i) => (
          <li key={title} className="flex items-center">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm leading-none font-bold transition-warm ${
                i === step
                  ? "bg-accent text-accent-foreground shadow-warm-sm"
                  : i < step
                    ? "bg-accent-secondary text-accent-secondary-foreground"
                    : "border border-border bg-surface opacity-60"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {i + 1}
            </span>
            {i < stepTitles.length - 1 && (
              <span
                className={`h-0.5 w-6 sm:w-10 ${i < step ? "bg-accent-secondary" : "bg-border"}`}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>

      <div className={step === 0 ? "flex flex-col gap-4" : "hidden"}>
        <h2 className="text-xl font-bold">{dict.requests.stepCategory}</h2>
        <CategoryIconGrid categories={categories} locale={locale} dict={dict} />
      </div>

      <div className={step === 1 ? "flex flex-col gap-4" : "hidden"}>
        <h2 className="text-xl font-bold">{dict.requests.stepDetails}</h2>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{dict.requests.titleLabel}</span>
          <input
            name="title"
            placeholder={dict.requests.titlePlaceholder}
            className="rounded-lg border border-border p-3"
          />
          {state?.errors?.title && <ErrorText>{dict.common.requiredField}</ErrorText>}
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{dict.requests.descriptionLabel}</span>
          <textarea
            name="description"
            rows={5}
            placeholder={dict.requests.descriptionPlaceholder}
            className="rounded-lg border border-border p-3"
          />
          {state?.errors?.description && <ErrorText>{dict.common.requiredField}</ErrorText>}
        </label>
      </div>

      <div className={step === 2 ? "flex flex-col gap-4" : "hidden"}>
        <h2 className="text-xl font-bold">{dict.requests.stepSchedule}</h2>
        <fieldset className="flex flex-col gap-2">
          <legend className="font-semibold">{dict.requests.urgencyLabel}</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="urgency" value="LOW" defaultChecked /> {dict.requests.urgencyLow}
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="urgency" value="MEDIUM" /> {dict.requests.urgencyMedium}
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="urgency" value="HIGH" /> {dict.requests.urgencyHigh}
          </label>
        </fieldset>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{dict.requests.preferredWhenLabel}</span>
          <input
            name="preferredWhen"
            placeholder={dict.requests.preferredWhenPlaceholder}
            className="rounded-lg border border-border p-3"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{dict.requests.neighborhoodLabel}</span>
          <input
            name="neighborhood"
            placeholder={dict.requests.neighborhoodPlaceholder}
            className="rounded-lg border border-border p-3"
          />
        </label>
      </div>

      <div className={step === 3 ? "flex flex-col gap-4" : "hidden"}>
        <h2 className="text-xl font-bold">{dict.requests.stepReview}</h2>
        <p className="opacity-80">{dict.requests.requestCreated}</p>
      </div>

      {state?.message && (
        <p className="text-sm font-medium text-red-700">{dict.common.genericError}</p>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-full border border-border px-6 py-3 font-semibold disabled:opacity-40"
        >
          {dict.common.back}
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground"
          >
            {dict.common.next}
          </button>
        ) : (
          <SubmitButton pendingLabel={dict.common.loading}>
            {dict.requests.submitRequest}
          </SubmitButton>
        )}
      </div>
    </form>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-red-700">{children}</span>;
}
