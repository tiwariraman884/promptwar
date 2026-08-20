import { describe, it, expect } from "vitest";
import { formatAuthError, isNetworkError } from "@/lib/auth-errors";

describe("formatAuthError & isNetworkError", () => {
  it("detects NetworkError correctly", () => {
    expect(isNetworkError(new Error("TypeError: NetworkError when attempting to fetch resource."))).toBe(true);
    expect(isNetworkError("Failed to fetch")).toBe(true);
    expect(isNetworkError("Invalid login credentials")).toBe(false);
  });
  it("formats NetworkError gracefully", () => {
    const error = new Error("TypeError: NetworkError when attempting to fetch resource.");
    const formatted = formatAuthError(error);
    expect(formatted).toContain("Unable to connect to the authentication server");
  });

  it("formats Failed to fetch gracefully", () => {
    const error = "Failed to fetch";
    const formatted = formatAuthError(error);
    expect(formatted).toContain("Unable to connect to the authentication server");
  });

  it("formats invalid credentials error", () => {
    const error = { message: "Invalid login credentials" };
    const formatted = formatAuthError(error);
    expect(formatted).toBe("Invalid email or password. Please try again.");
  });

  it("formats email not confirmed error", () => {
    const error = "Email not confirmed";
    const formatted = formatAuthError(error);
    expect(formatted).toBe("Please confirm your email address before signing in.");
  });

  it("returns fallback for null or empty error", () => {
    expect(formatAuthError(null)).toBe("An unexpected error occurred. Please try again.");
  });
});
