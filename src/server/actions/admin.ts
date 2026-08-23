"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { dispatchNotification } from "@/server/notifications/service";
import type { Locale } from "@/i18n/dictionaries";
import { ROLES, type UserStatus } from "@/lib/constants";
import type { Role } from "@/lib/constants";

export async function approveUser(locale: Locale, userId: string, formData: FormData) {
  await requireAdmin(locale);
  const role = formData.get("role");
  if (typeof role !== "string" || !ROLES.includes(role as Role)) return;
  await prisma.user.update({
    where: { id: userId },
    data: { role: role as Role, status: "ACTIVE" },
  });
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/admin/users`);
}

export async function setUserStatus(locale: Locale, userId: string, status: UserStatus) {
  await requireAdmin(locale);
  await prisma.user.update({ where: { id: userId }, data: { status } });
  revalidatePath(`/${locale}/admin/users`);
}

export async function setUserRole(locale: Locale, userId: string, role: Role) {
  await requireAdmin(locale);
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath(`/${locale}/admin/users`);
}

export async function createCategory(locale: Locale, formData: FormData) {
  await requireAdmin(locale);
  const labelEn = String(formData.get("labelEn") ?? "").trim();
  const labelVi = String(formData.get("labelVi") ?? "").trim();
  const icon = String(formData.get("icon") ?? "✨").trim();
  if (!labelEn || !labelVi) return;

  const slug = labelEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const count = await prisma.helpCategory.count();
  await prisma.helpCategory.create({
    data: { slug: `${slug}-${count}`, labelEn, labelVi, icon, sortOrder: count },
  });
  revalidatePath(`/${locale}/admin/categories`);
  revalidatePath(`/${locale}/requests/new`);
}

export async function setCategoryActive(locale: Locale, categoryId: string, active: boolean) {
  await requireAdmin(locale);
  await prisma.helpCategory.update({ where: { id: categoryId }, data: { active } });
  revalidatePath(`/${locale}/admin/categories`);
  revalidatePath(`/${locale}/requests/new`);
}

export async function updatePage(locale: Locale, slug: string, formData: FormData) {
  await requireAdmin(locale);
  const titleEn = String(formData.get("titleEn") ?? "");
  const titleVi = String(formData.get("titleVi") ?? "");
  const bodyEn = String(formData.get("bodyEn") ?? "");
  const bodyVi = String(formData.get("bodyVi") ?? "");

  await prisma.page.upsert({
    where: { slug },
    create: { slug, titleEn, titleVi, bodyEn, bodyVi },
    update: { titleEn, titleVi, bodyEn, bodyVi },
  });

  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/pages/${slug}`);
}

export async function sendTestViberNotification(locale: Locale) {
  const admin = await requireAdmin(locale);
  await dispatchNotification({
    name: "TEST",
    summary: `Test notification triggered by ${admin.name} from the admin panel`,
    data: { triggeredBy: admin.id },
  });
  revalidatePath(`/${locale}/admin/notifications`);
}
