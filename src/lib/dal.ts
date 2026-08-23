import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { decryptSession, getSessionCookieValue } from "@/lib/session";
import type { Locale } from "@/i18n/dictionaries";

export const verifySession = cache(async () => {
  const cookie = await getSessionCookieValue();
  return decryptSession(cookie);
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      locale: true,
    },
  });
});

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Redirects to login if there's no session at all. */
export async function requireUser(locale: Locale): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  return user;
}

/** Redirects to the pending-approval screen for accounts awaiting admin sign-off. */
export async function requireActiveUser(locale: Locale): Promise<SessionUser> {
  const user = await requireUser(locale);
  if (user.status !== "ACTIVE") redirect(`/${locale}/pending-approval`);
  return user;
}

export async function requireAdmin(locale: Locale): Promise<SessionUser> {
  const user = await requireActiveUser(locale);
  if (user.role !== "ADMIN") redirect(`/${locale}/dashboard`);
  return user;
}
