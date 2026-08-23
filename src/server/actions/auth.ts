"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { LoginSchema, SignupSchema } from "@/lib/validation";
import type { Locale } from "@/i18n/dictionaries";

export type AuthFormState = {
  errors?: Record<string, string>;
  message?: string;
} | undefined;

export async function signup(
  locale: Locale,
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { errors: flattenZodErrors(parsed.error) };
  }

  const { name, email, password, phone, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: "emailTaken" } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, role, locale, status: "PENDING" },
  });

  await createSession(user.id);
  redirect(`/${locale}/pending-approval`);
}

export async function login(
  locale: Locale,
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: flattenZodErrors(parsed.error) };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "invalidCredentials" };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { message: "invalidCredentials" };
  }

  await createSession(user.id);

  if (user.status !== "ACTIVE") {
    redirect(`/${locale}/pending-approval`);
  }
  redirect(`/${locale}/dashboard`);
}

export async function logout(locale: Locale) {
  await deleteSession();
  redirect(`/${locale}/login`);
}

function flattenZodErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
