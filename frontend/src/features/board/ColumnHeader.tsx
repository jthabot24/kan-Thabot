import type { BoardColumn } from "../../api/types";
import { toInt } from "./utils";

interface ColumnHeaderProps {
  column: BoardColumn;
  hidden: boolean;
  compact: boolean;
  onToggle: () => void;
}

export function ColumnHeader({ column, hidden, compact, onToggle }: ColumnHeaderProps) {
  const count = toInt(column.nb_tasks);
  const unfiltered = toInt(column.nb_unfiltered_tasks_across_swimlane);
  const limit = toInt(column.task_limit);
  return (
    <th className={`board-column-header board-column-header-${toInt(column.id)}${hidden ? " board-column-header-collapsed" : ""}${compact && !hidden ? " board-column-compact" : ""}`}>
      {hidden ? (
        <span className="board-column-collapsed" title="Show this column">
          <button type="button" onClick={onToggle} aria-label={`Show ${column.title}`}>＋ {count}</button>
        </span>
      ) : (
        <div className="board-column-expanded board-column-expanded-header">
          <span className="board-column-title">{column.title}</span>
          <button type="button" className="board-column-toggle" onClick={onToggle} title="Hide this column" aria-label={`Hide ${column.title}`}>×</button>
          <span className="board-column-header-task-count" title="Task count">
            {count} ({unfiltered}{limit ? `/${limit}` : ""}) · {toInt(column.score)}
          </span>
        </div>
      )}
    </th>
  );
}
