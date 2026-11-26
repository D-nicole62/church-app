const sermonDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Lusaka",
});

export function formatSermonDate(date: Date) {
  return sermonDate.format(date);
}

export function shortDescription(value: string | null | undefined, max = 160) {
  if (!value) return null;
  const text = value
    .replace(/<\/?[a-z][^>]*>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > 80 ? slice.slice(0, lastSpace) : slice;
  return `${base.trimEnd()}…`;
}
