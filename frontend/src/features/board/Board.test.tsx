import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Board } from "./Board";
import { getBoard } from "../../api/procedures";

vi.mock("../../api/procedures", () => ({ getBoard: vi.fn(), moveTaskPosition: vi.fn() }));

const board = [
  { id: 1, name: "Doing", project_id: 1, nb_swimlanes: 2, columns: [{ id: 11, title: "Todo", project_id: 1, tasks: [{ id: 100, title: "First task", project_id: 1, column_id: 11, swimlane_id: 1, position: 1, is_active: 1, is_draggable: true }] }, { id: 12, title: "Done", project_id: 1, tasks: [] }] },
  { id: 2, name: "Review", project_id: 1, nb_swimlanes: 2, columns: [{ id: 11, title: "Todo", project_id: 1, tasks: [] }, { id: 12, title: "Done", project_id: 1, tasks: [{ id: 101, title: "Second task", project_id: 1, column_id: 12, swimlane_id: 2, position: 1, is_active: 1, is_draggable: true }] }] },
];

describe("Board", () => {
  beforeEach(() => {
    vi.mocked(getBoard).mockResolvedValue(board);
    localStorage.clear();
  });
  it("renders swimlanes, columns, and tasks", async () => {
    render(<Board projectId={1} pollInterval={60} />);
    expect(await screen.findByText("Doing")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getAllByText("Todo")).toHaveLength(2);
    expect(screen.getByText("First task")).toBeInTheDocument();
    expect(screen.getByText("Second task")).toBeInTheDocument();
  });
  it("switches a hidden column to collapsed markup", async () => {
    render(<Board projectId={1} pollInterval={60} />);
    await screen.findByText("First task");
    fireEvent.click(screen.getAllByRole("button", { name: /Hide Todo/ })[0]);
    expect(screen.getAllByRole("button", { name: /Show Todo/ })).toHaveLength(2);
  });
  it("omits swimlane headers for one swimlane", async () => {
    vi.mocked(getBoard).mockResolvedValue([board[0]]);
    render(<Board projectId={1} pollInterval={60} />);
    await screen.findByText("First task");
    expect(screen.queryByText("Doing")).not.toBeInTheDocument();
  });
});
