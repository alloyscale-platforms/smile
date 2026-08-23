"use client";

import { useActionState } from "react";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { login, type AuthFormState } from "@/server/actions/auth";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const loginWithLocale = login.bind(null, locale);
  const [state, action] = useActionState<AuthFormState, FormData>(loginWithLocale, undefined);

  return (
    <form action={action} className="flex max-w-md flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{dict.auth.emailLabel}</span>
        <input name="email" type="email" required className="rounded-lg border border-border p-3" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">{dict.auth.passwordLabel}</span>
        <input name="password" type="password" required className="rounded-lg border border-border p-3" />
      </label>

      {state?.message && (
        <p className="text-sm font-medium text-red-700">
          {state.message === "invalidCredentials" ? dict.auth.invalidCredentials : dict.common.genericError}
        </p>
      )}

      <SubmitButton pendingLabel={dict.common.loading}>{dict.auth.loginSubmit}</SubmitButton>
    </form>
  );
}
