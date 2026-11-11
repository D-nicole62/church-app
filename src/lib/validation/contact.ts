export const PHONE_ERROR_MESSAGE =
  "Enter a valid phone number (e.g. 0971234567)";

export const EMAIL_ERROR_MESSAGE = "Enter a valid email address.";

/** Accept 0971234567, +260971234567, and 260971234567. */
export function isValidZambianPhone(value: string) {
  const compact = value.replace(/[\s()-]/g, "");
  if (!compact || /[a-z]/i.test(compact)) {
    return false;
  }

  if (compact.startsWith("+")) {
    return /^\+260\d{9}$/.test(compact);
  }
  if (compact.startsWith("260")) {
    return /^260\d{9}$/.test(compact);
  }
  return /^0\d{9}$/.test(compact);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
