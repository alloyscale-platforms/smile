"use client";

import { useActionState } from "react";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { sendMessage, type RequestFormState } from "@/server/actions/requests";
import { SubmitButton } from "./SubmitButton";

export function MessageForm({
  locale,
  requestId,
  dict,
}: {
  locale: Locale;
  requestId: string;
  dict: Dictionary;
}) {
  const action = sendMessage.bind(null, locale, requestId);
  const [state, formAction] = useActionState<RequestFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex gap-3">
      <label className="sr-only" htmlFor="message-body">
        {dict.requests.messagePlaceholder}
      </label>
      <textarea
        id="message-body"
        name="body"
        rows={2}
        placeholder={dict.requests.messagePlaceholder}
        className="flex-1 rounded-lg border border-border p-3"
      />
      <SubmitButton pendingLabel={dict.common.loading}>{dict.requests.sendMessage}</SubmitButton>
      {state?.errors?.body && (
        <span className="text-sm font-medium text-red-700">{dict.common.requiredField}</span>
      )}
    </form>
  );
}
