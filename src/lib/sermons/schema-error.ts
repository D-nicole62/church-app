export function isMissingColumnError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && (error as { code?: unknown }).code === "P2022") return true;
  const message = "message" in error ? String((error as { message?: unknown }).message) : "";
  return /column/i.test(message) && /does not exist/i.test(message);
}
