/**
 * Labels that are clearly leftover test or placeholder content.
 * Matching is exact after trimming and lowercasing, so real titles such as
 * "Women's conference" are not removed on their own.
 */
export const PLACEHOLDER_LABELS = [
  "testing events",
  "testing event",
  "test events",
  "test event",
  "testing",
  "test",
  "rops",
  "lorem",
  "lorem ipsum",
  "placeholder",
  "placeholder text",
  "dummy",
  "asdf",
] as const;

const PLACEHOLDER_LABEL_SET = new Set<string>(PLACEHOLDER_LABELS);

export function normalizeContentLabel(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

export function isPlaceholderLabel(value: string | null | undefined) {
  return PLACEHOLDER_LABEL_SET.has(normalizeContentLabel(value));
}

/** Public events whose title is a known test label. Descriptions are not matched. */
export function isPlaceholderEvent(event: {
  title: string;
  description?: string | null;
}) {
  return isPlaceholderLabel(event.title);
}
