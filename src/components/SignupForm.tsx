"use client";

import { useActionState } from "react";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { signup, type AuthFormState } from "@/server/actions/auth";
import { SubmitButton } from "./SubmitButton";

export function SignupForm({
  locale,
  dict,
  initialRole,
}: {
  locale: Locale;
  dict: Dictionary;
  initialRole: "HELPER" | "REQUESTER";
}) {
  const signupWithLocale = signup.bind(null, locale);
  const [state, action] = useActionState<AuthFormState, FormData>(signupWithLocale, undefined);

  return (
    <form action={action} className="flex max-w-md flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">{dict.auth.roleQuestion}</legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface p-4 has-[:checked]:border-accent">
          <input type="radio" name="role" value="REQUESTER" defaultChecked={initialRole === "REQUESTER"} className="mt-1" />
          <span>
            <span className="block font-semibold">{dict.auth.roleRequester}</span>
            <span className="block text-sm opacity-80">{dict.auth.roleRequesterHint}</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface p-4 has-[:checked]:border-accent">
          <input type="radio" name="role" value="HELPER" defaultChecked={initialRole === "HELPER"} className="mt-1" />
          <span>
            <span className="block font-semibold">{dict.auth.roleHelper}</span>
            <span className="block text-sm opacity-80">{dict.auth.roleHelperHint}</span>
          </span>
        </label>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">{dict.auth.nameLabel}</span>
        <input name="name" required className="rounded-lg border border-border p-3" />
        {state?.errors?.name && <ErrorText>{dict.common.requiredField}</ErrorText>}
      </label>

      <p className="text-sm opacity-80">{dict.auth.emailOrPhoneHint}</p>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">{dict.auth.emailLabel}</span>
        <input name="email" type="email" className="rounded-lg border border-border p-3" />
        {state?.errors?.email && (
          <ErrorText>
            {state.errors.email === "emailTaken"
              ? dict.auth.emailTaken
              : state.errors.email === "emailOrPhoneRequired"
                ? dict.auth.emailOrPhoneRequired
                : dict.common.genericError}
          </ErrorText>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">{dict.auth.phoneLabel}</span>
        <input name="phone" type="tel" className="rounded-lg border border-border p-3" />
        {state?.errors?.phone && (
          <ErrorText>
            {state.errors.phone === "phoneTaken" ? dict.auth.phoneTaken : dict.common.genericError}
          </ErrorText>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">{dict.auth.passwordLabel}</span>
        <input name="password" type="password" required minLength={8} className="rounded-lg border border-border p-3" />
        {state?.errors?.password && <ErrorText>{dict.auth.passwordTooShort}</ErrorText>}
      </label>

      <SubmitButton
        pendingLabel={dict.common.loading}
        className="w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-warm-sm transition-warm hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
      >
        {dict.auth.signupSubmit}
      </SubmitButton>
    </form>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-red-700">{children}</span>;
}
