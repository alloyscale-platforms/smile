import { z } from "zod";
import { URGENCIES } from "@/lib/constants";

/** Strips everything but digits and a leading "+" so phone numbers entered
 * in different formats (spaces, dashes, parens) still match on lookup. */
export function normalizePhone(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, "");
}

export const SignupSchema = z
  .object({
    name: z.string().trim().min(2, "nameTooShort"),
    email: z.string().trim().toLowerCase().pipe(z.email("invalidEmail")).optional(),
    phone: z.string().trim().transform(normalizePhone).optional(),
    password: z.string().min(8, "passwordTooShort"),
    role: z.enum(["HELPER", "REQUESTER"]),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "emailOrPhoneRequired",
    path: ["email"],
  });

export const LoginSchema = z.object({
  identifier: z.string().trim().min(1, "requiredField"),
  password: z.string().min(1, "requiredField"),
});

export const CreateRequestSchema = z.object({
  categoryId: z.string().min(1, "requiredField"),
  title: z.string().trim().min(3, "requiredField").max(120),
  description: z.string().trim().min(3, "requiredField").max(2000),
  urgency: z.enum(URGENCIES),
  preferredWhen: z.string().trim().max(200).optional(),
  neighborhood: z.string().trim().max(120).optional(),
});

export const MessageSchema = z.object({
  body: z.string().trim().min(1, "requiredField").max(2000),
});
