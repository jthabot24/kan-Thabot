import { beforeEach, describe, expect, it } from "vitest";
import {
  getHiddenSwimlanes, isColumnHidden, resetSingleSwimlane, setColumnHidden,
  setHiddenSwimlanes, toggleHiddenSwimlane,
} from "./preferences";

beforeEach(() => localStorage.clear());

describe("board preferences", () => {
  it("toggles hidden columns", () => {
    expect(isColumnHidden(4)).toBe(false);
    setColumnHidden(4, true);
    expect(isColumnHidden(4)).toBe(true);
    setColumnHidden(4, false);
    expect(isColumnHidden(4)).toBe(false);
  });
  it("stores and toggles swimlane lists", () => {
    setHiddenSwimlanes(2, [4]);
    expect(getHiddenSwimlanes(2)).toEqual([4]);
    expect(toggleHiddenSwimlane(2, 5)).toEqual([4, 5]);
    expect(toggleHiddenSwimlane(2, 4)).toEqual([5]);
  });
  it("resets hidden swimlanes for a single lane", () => {
    setHiddenSwimlanes(2, [4]);
    resetSingleSwimlane(2, 1);
    expect(getHiddenSwimlanes(2)).toEqual([]);
  });
});
