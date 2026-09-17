import type { BoardTask } from "../../api/types";
import { ageInDays, formatDueDate, isOverdue, isToday, toInt } from "./utils";

interface TaskCardProps {
  task: BoardTask;
  collapsed: boolean;
  highlightPeriod: number;
  saving: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

function initials(task: BoardTask): string {
  const name = task.assignee_name || task.assignee_username || "";
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function TaskCard({ task, collapsed, highlightPeriod, saving, onDragStart, onDragEnd }: TaskCardProps) {
  const now = Date.now();
  const active = toInt(task.is_active) === 1;
  const recent = toInt(task.date_modification) * 1000 > now - highlightPeriod * 1000;
  const subtasks = toInt(task.nb_subtasks);
  const completed = toInt(task.nb_completed_subtasks);
  const due = toInt(task.date_due);
  return (
    <div
      className={`task-board ${task.is_draggable ? "draggable-item " : ""}${active ? "task-board-status-open " : "task-board-status-closed "}${recent ? "task-board-recent " : ""}color-${toInt(task.color_id)}${saving ? " task-board-saving-state" : ""}`}
      draggable={Boolean(task.is_draggable)}
      data-task-id={task.id}
      data-column-id={task.column_id}
      data-swimlane-id={task.swimlane_id}
      data-position={task.position}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {saving && <span className="task-board-saving-icon" aria-label="Saving">⟳</span>}
      {collapsed ? (
        <div className="task-board-collapsed">
          <strong>#{task.id}</strong> {initials(task) && <span title={task.assignee_name || task.assignee_username}>{initials(task)}</span>} - {task.title}
        </div>
      ) : (
        <div className="task-board-expanded">
          <div className="task-board-header">
            <strong>#{task.id}</strong>
            {task.assignee_name || task.assignee_username ? <span className="task-board-assignee">{task.assignee_name || task.assignee_username}</span> : null}
            {initials(task) && <span className="task-board-avatar" title={task.assignee_name || task.assignee_username}>{initials(task)}</span>}
          </div>
          <div className="task-board-title" title={task.title}>{task.title}</div>
          <div className="task-board-footer">
            {task.category_name && <span className={`task-board-category color-${toInt(task.category_color_id)}`}>{task.category_name}</span>}
            {task.tags?.map((tag) => <span className={`task-tag color-${toInt(tag.color_id)}`} key={String(tag.id)}>{tag.name}</span>)}
            {task.reference && <span title="Reference">{task.reference}</span>}
            {toInt(task.is_milestone) === 1 && <span title="Milestone" aria-label="Milestone">⚑</span>}
            {toInt(task.score) !== 0 && <span title="Complexity">★ {task.score}</span>}
            {(toInt(task.time_spent) || toInt(task.time_estimated)) ? <span title="Time spent and estimated">{task.time_spent || 0}/{task.time_estimated || 0}h</span> : null}
            {due > 0 && <span className={`task-date${isOverdue(due, now) ? " task-date-overdue" : isToday(due, now) ? " task-date-today" : ""}`} title="Due date">◷ {formatDueDate(due)}</span>}
            {toInt(task.recurrence_status) !== 0 && <span title="Recurring">↻</span>}
            {toInt(task.nb_links) > 0 && <span title="Links">⑂ {task.nb_links}</span>}
            {toInt(task.nb_external_links) > 0 && <span title="External links">↗ {task.nb_external_links}</span>}
            {subtasks > 0 && <span title="Subtasks">☷ {Math.round(completed / subtasks * 100)}%</span>}
            {toInt(task.nb_files) > 0 && <span title="Files">⌕ {task.nb_files}</span>}
            {toInt(task.nb_comments) > 0 && <span title="Comments">◌ {task.nb_comments}</span>}
            {task.description && <span title="Description">▤</span>}
            {active ? <span title="Task age / column age">⌛ {ageInDays(task.date_creation, now)}/{ageInDays(task.date_moved, now)}d</span> : <span>Closed</span>}
            {toInt(task.priority) !== 0 && <span title="Priority">P{task.priority}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
