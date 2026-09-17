import { describe, expect, it } from "vitest";
import { ageInDays, formatDueDate, isOverdue, isToday } from "./utils";

describe("board date utilities", () => {
  const now = Date.UTC(2025, 0, 15, 12);
  it("identifies overdue and today dates", () => {
    expect(isOverdue((now / 1000) - 3600, now)).toBe(true);
    expect(isToday(Date.UTC(2025, 0, 15, 20) / 1000, now)).toBe(true);
    expect(isToday(Date.UTC(2025, 0, 16, 12) / 1000, now)).toBe(false);
  });
  it("calculates age in days", () => {
    expect(ageInDays((now / 1000) - 3 * 86400 - 3600, now)).toBe(3);
  });
  it("formats a unix due date", () => {
    expect(formatDueDate(Date.UTC(2025, 0, 15, 0) / 1000, "en-US")).toContain("1/15/2025");
  });
});
