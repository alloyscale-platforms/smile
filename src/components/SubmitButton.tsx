"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "rounded-full bg-accent px-6 py-3 text-base font-semibold text-accent-foreground disabled:opacity-60"
      }
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
