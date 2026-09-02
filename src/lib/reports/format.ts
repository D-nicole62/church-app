export function formatPercent(value: number, total: number) {
  if (total === 0) {
    return "0%";
  }
  return `${Math.round((value / total) * 1000) / 10}%`;
}

export function formatDays(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} day${rounded === 1 ? "" : "s"}`;
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthKey(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
