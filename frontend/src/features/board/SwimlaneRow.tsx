import type { BoardSwimlane } from "../../api/types";
import { toInt } from "./utils";

interface SwimlaneRowProps {
  swimlane: BoardSwimlane;
  hidden: boolean;
  onToggle: () => void;
}

export function SwimlaneRow({ swimlane, hidden, onToggle }: SwimlaneRowProps) {
  const count = toInt(swimlane.nb_tasks);
  const limit = toInt(swimlane.task_limit);
  return (
    <tr className="board-swimlane-header-row" id={`swimlane-${swimlane.id}`}>
      <th className="board-swimlane-header" colSpan={swimlane.columns.length}>
        <button type="button" className="board-swimlane-toggle" onClick={onToggle}
          aria-label={hidden ? "Expand swimlane" : "Collapse swimlane"} title={hidden ? "Expand swimlane" : "Collapse swimlane"}>
          {hidden ? "▾" : "▴"}
        </button>
        <span>{swimlane.name}</span>
        <span className="board-column-header-task-count" title="Number of tasks in this swimlane">
          ({count}{limit ? `/${limit}` : ""})
        </span>
      </th>
    </tr>
  );
}
