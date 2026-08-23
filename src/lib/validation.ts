import { z } from "zod";
import { URGENCIES } from "@/lib/constants";

/** Strips everything but digits and a leading "+" so phone numbers entered
 * in different formats (spaces, dashes, parens) still match on lookup. */
export function normalizePhone(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, "");
}

/** One field, either shape: contains "@" → treated as email, else → phone. */
export const SignupSchema = z
  .object({
    name: z.string().trim().min(2, "nameTooShort"),
    identifier: z.string().trim().min(1, "emailOrPhoneRequired"),
    password: z.string().min(8, "passwordTooShort"),
    role: z.enum(["HELPER", "REQUESTER"]),
  })
  .refine(
    (data) =>
      !data.identifier.includes("@") ||
      z.email().safeParse(data.identifier.trim().toLowerCase()).success,
    { message: "invalidEmail", path: ["identifier"] },
  )
  .transform(({ identifier, ...rest }) => {
    const isEmail = identifier.includes("@");
    return {
      ...rest,
      email: isEmail ? identifier.trim().toLowerCase() : undefined,
      phone: isEmail ? undefined : normalizePhone(identifier),
    };
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
