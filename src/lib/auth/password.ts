import { hash } from "bcryptjs";

/** The password created by the seed script when ADMIN_SEED_PASSWORD is unset. */
export const DEFAULT_SEED_PASSWORD = "ChangeMe123!";

export const MIN_PASSWORD_LENGTH = 10;

export function isDefaultSeedPassword(password: string) {
  return password === DEFAULT_SEED_PASSWORD;
}

export function passwordChangeError(password: string, confirm: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (isDefaultSeedPassword(password)) {
    return "Choose a password that is not the original setup password.";
  }
  if (password !== confirm) {
    return "The new password and confirmation do not match.";
  }
  return null;
}

export function hashPassword(password: string) {
  return hash(password, 12);
}
