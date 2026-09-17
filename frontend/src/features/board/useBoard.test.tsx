import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBoard } from "./useBoard";
import { getBoard, moveTaskPosition } from "../../api/procedures";

vi.mock("../../api/procedures", () => ({ getBoard: vi.fn(), moveTaskPosition: vi.fn() }));

const payload = [{ id: 1, name: "Lane", project_id: 1, columns: [
  { id: 2, title: "Todo", project_id: 1, tasks: [{ id: 7, title: "Task", project_id: 1, column_id: 2, swimlane_id: 1, position: 1, is_active: 1, is_draggable: true }] },
  { id: 3, title: "Done", project_id: 1, tasks: [] },
] }];

describe("useBoard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getBoard).mockResolvedValue(payload);
    vi.mocked(moveTaskPosition).mockResolvedValue(true);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  });
  it("loads and skips identical payload state updates", async () => {
    const { result } = renderHook(() => useBoard(1, { pollInterval: 1 }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(result.current.swimlanes).toHaveLength(1);
    const reference = result.current.swimlanes;
    await act(async () => { vi.advanceTimersByTime(1000); await Promise.resolve(); });
    expect(result.current.swimlanes).toBe(reference);
  });
  it("skips polling while hidden", async () => {
    const { result } = renderHook(() => useBoard(1, { pollInterval: 1 }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    vi.mocked(getBoard).mockClear();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(getBoard).not.toHaveBeenCalled();
    result.current.refresh();
  });
  it("moves a task and refreshes", async () => {
    const { result } = renderHook(() => useBoard(1, { pollInterval: 60 }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(result.current.swimlanes).toHaveLength(1);
    await act(async () => { await result.current.moveTask({ taskId: 7, srcColumnId: 2, dstColumnId: 3, dstSwimlaneId: 1, position: 1 }); });
    expect(moveTaskPosition).toHaveBeenCalledWith(1, 7, 3, 1, 1);
  });
  it("reverts when move fails", async () => {
    vi.mocked(moveTaskPosition).mockRejectedValue(new Error("save failed"));
    const { result } = renderHook(() => useBoard(1, { pollInterval: 60 }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(result.current.swimlanes).toHaveLength(1);
    await act(async () => { await result.current.moveTask({ taskId: 7, srcColumnId: 2, dstColumnId: 2, dstSwimlaneId: 1, position: 1 }); });
    expect(result.current.error).toBe("save failed");
  });
});
