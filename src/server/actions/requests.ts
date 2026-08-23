"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { CreateRequestSchema, MessageSchema } from "@/lib/validation";
import { dispatchNotification } from "@/server/notifications/service";
import type { Locale } from "@/i18n/dictionaries";
import { REQUEST_STATUS_TRANSITIONS, type RequestStatus } from "@/lib/constants";

export type RequestFormState = {
  errors?: Record<string, string>;
  message?: string;
} | undefined;

export async function createRequest(
  locale: Locale,
  _prevState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") {
    return { message: "genericError" };
  }

  const parsed = CreateRequestSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    description: formData.get("description"),
    urgency: formData.get("urgency"),
    preferredWhen: formData.get("preferredWhen") || undefined,
    neighborhood: formData.get("neighborhood") || undefined,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { errors };
  }

  const request = await prisma.helpRequest.create({
    data: { ...parsed.data, requesterId: user.id },
    include: { category: true },
  });

  await dispatchNotification({
    name: "REQUEST_CREATED",
    summary: `New request: "${request.title}" (${request.category.labelEn}) posted by ${user.name}`,
    data: { requestId: request.id, requesterId: user.id, category: request.category.slug },
  });

  revalidatePath(`/${locale}/requests`);
  redirect(`/${locale}/requests/${request.id}`);
}

export async function claimRequest(locale: Locale, requestId: string) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") return;
  if (user.role !== "HELPER" && user.role !== "ADMIN") return;

  const request = await prisma.helpRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "OPEN") return;

  const updated = await prisma.helpRequest.update({
    where: { id: requestId },
    data: { status: "CLAIMED", claimedById: user.id },
  });

  await dispatchNotification({
    name: "REQUEST_CLAIMED",
    summary: `"${updated.title}" was claimed by ${user.name}`,
    data: { requestId: updated.id, helperId: user.id },
  });

  revalidatePath(`/${locale}/requests`);
  revalidatePath(`/${locale}/requests/${requestId}`);
}

export async function updateRequestStatus(
  locale: Locale,
  requestId: string,
  nextStatus: RequestStatus,
) {
  const user = await getCurrentUser();
  if (!user) return;

  const request = await prisma.helpRequest.findUnique({ where: { id: requestId } });
  if (!request) return;

  const isParticipant =
    request.requesterId === user.id || request.claimedById === user.id || user.role === "ADMIN";
  if (!isParticipant) return;

  if (!REQUEST_STATUS_TRANSITIONS[request.status as RequestStatus].includes(nextStatus)) return;

  await prisma.helpRequest.update({ where: { id: requestId }, data: { status: nextStatus } });
  revalidatePath(`/${locale}/requests`);
  revalidatePath(`/${locale}/requests/${requestId}`);
}

export async function sendMessage(
  locale: Locale,
  requestId: string,
  _prevState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "genericError" };

  const request = await prisma.helpRequest.findUnique({ where: { id: requestId } });
  if (!request) return { message: "genericError" };

  const isParticipant =
    request.requesterId === user.id || request.claimedById === user.id || user.role === "ADMIN";
  if (!isParticipant) return { message: "genericError" };

  const parsed = MessageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { errors: { body: parsed.error.issues[0]?.message ?? "requiredField" } };
  }

  await prisma.requestMessage.create({
    data: { requestId, senderId: user.id, body: parsed.data.body },
  });

  revalidatePath(`/${locale}/requests/${requestId}`);
}
