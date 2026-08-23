import { z } from "zod";
import { URGENCIES } from "@/lib/constants";

export const SignupSchema = z.object({
  name: z.string().trim().min(2, "nameTooShort"),
  email: z.string().trim().toLowerCase().pipe(z.email("invalidEmail")),
  password: z.string().min(8, "passwordTooShort"),
  phone: z.string().trim().optional(),
  role: z.enum(["HELPER", "REQUESTER"]),
});

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("invalidEmail")),
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
