export function setAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "eco_auth=true; path=/; max-age=2592000; SameSite=Lax";
  }
}

export function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "eco_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}
