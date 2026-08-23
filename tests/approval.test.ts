import { describe, expect, it } from "vitest";
import { SignupSchema, LoginSchema } from "@/lib/validation";

describe("SignupSchema", () => {
  it("accepts a valid requester signup", () => {
    const result = SignupSchema.safeParse({
      name: "Nguyen Van A",
      identifier: "a@example.com",
      password: "supersecret1",
      role: "REQUESTER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects signing up directly as an admin", () => {
    const result = SignupSchema.safeParse({
      name: "Nguyen Van A",
      identifier: "a@example.com",
      password: "supersecret1",
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = SignupSchema.safeParse({
      name: "Nguyen Van A",
      identifier: "a@example.com",
      password: "short",
      role: "HELPER",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = SignupSchema.safeParse({
      name: "Nguyen Van A",
      identifier: "not-an-email@",
      password: "supersecret1",
      role: "HELPER",
    });
    expect(result.success).toBe(false);
  });

  it("lowercases and trims the email, and routes it to the email field", () => {
    const result = SignupSchema.safeParse({
      name: "Nguyen Van A",
      identifier: "  A@Example.com  ",
      password: "supersecret1",
      role: "HELPER",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("a@example.com");
      expect(result.data.phone).toBeUndefined();
    }
  });

  it("accepts a phone number identifier and routes it to the phone field", () => {
    const result = SignupSchema.safeParse({
      name: "Nguyen Van A",
      identifier: "(555) 123-4567",
      password: "supersecret1",
      role: "HELPER",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("5551234567");
      expect(result.data.email).toBeUndefined();
    }
  });

  it("rejects a signup with an empty identifier", () => {
    const result = SignupSchema.safeParse({
      name: "Nguyen Van A",
      identifier: "",
      password: "supersecret1",
      role: "HELPER",
    });
    expect(result.success).toBe(false);
  });
});

describe("LoginSchema", () => {
  it("requires a non-empty password", () => {
    const result = LoginSchema.safeParse({ identifier: "a@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a phone number as the identifier", () => {
    const result = LoginSchema.safeParse({ identifier: "555-123-4567", password: "supersecret1" });
    expect(result.success).toBe(true);
  });
});
