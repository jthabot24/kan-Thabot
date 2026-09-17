import type { Numeric } from "../../api/types";

export function toInt(value: Numeric | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

export function isOverdue(dateDue: Numeric | null | undefined, now = Date.now()): boolean {
  const due = toInt(dateDue);
  return due > 0 && due * 1000 < now;
}

export function isToday(dateDue: Numeric | null | undefined, now = Date.now()): boolean {
  const due = toInt(dateDue);
  if (!due) return false;
  const dueDate = new Date(due * 1000);
  const today = new Date(now);
  return dueDate.toDateString() === today.toDateString();
}

export function ageInDays(timestamp: Numeric | null | undefined, now = Date.now()): number {
  const value = toInt(timestamp);
  if (!value) return 0;
  return Math.max(0, Math.floor((now - value * 1000) / 86400000));
}

export function formatDueDate(
  dateDue: Numeric | null | undefined,
  locale = "en-US",
): string {
  const due = toInt(dateDue);
  if (!due) return "";
  const date = new Date(due * 1000);
  const dateOnly = date.getHours() === 0 && date.getMinutes() === 0;
  return dateOnly
    ? date.toLocaleDateString(locale)
    : date.toLocaleString(locale, { dateStyle: "short", timeStyle: "short" });
}
