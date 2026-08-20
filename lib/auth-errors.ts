export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : typeof (error as { message?: string }).message === "string"
      ? (error as { message: string }).message
      : String(error);

  const lower = message.toLowerCase();

  return (
    lower.includes("networkerror") ||
    lower.includes("failed to fetch") ||
    lower.includes("fetch failed") ||
    lower.includes("network error") ||
    lower.includes("load failed") ||
    lower.includes("err_name_not_resolved") ||
    lower.includes("econnrefused") ||
    (lower.includes("typeerror") && lower.includes("fetch"))
  );
}

/**
 * Formats authentication error messages to be user-friendly,
 * specifically handling NetworkError/fetch failures gracefully.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  if (isNetworkError(error)) {
    return "Unable to connect to the authentication server. Falling back to local session.";
  }

  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : typeof (error as { message?: string }).message === "string"
      ? (error as { message: string }).message
      : String(error);

  const lower = message.toLowerCase();

  // Common Supabase auth messages
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_grant")
  ) {
    return "Invalid email or password. Please try again.";
  }

  if (lower.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }

  if (
    lower.includes("user already registered") ||
    lower.includes("already exists")
  ) {
    return "An account with this email address already exists.";
  }

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }

  return message;
}
