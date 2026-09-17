import { useState } from "react";
import type { BoardColumn, BoardSwimlane } from "../../api/types";
import type { MoveTaskInput } from "./types";
import { toInt } from "./utils";
import { TaskCard } from "./TaskCard";

interface TaskRowProps {
  swimlane: BoardSwimlane;
  hiddenColumns: Set<number>;
  compactVertical: boolean;
  collapsedCards: boolean;
  highlightPeriod: number;
  savingTaskId: number | null;
  draggingTaskId: number | null;
  onMove: (move: MoveTaskInput) => void;
  onDragState: (taskId: number | null) => void;
  onToggleColumn: (columnId: number) => void;
}

function taskBefore(event: React.DragEvent<HTMLDivElement>): number {
  const target = event.currentTarget;
  const cards = [...target.querySelectorAll<HTMLElement>(".task-board:not(.draggable-item-selected)")];
  const y = event.clientY;
  const before = cards.findIndex((card) => y < card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2);
  return before < 0 ? cards.length : before;
}

function DropZone({ column, swimlane, props }: { column: BoardColumn; swimlane: BoardSwimlane; props: TaskRowProps }) {
  const [over, setOver] = useState(false);
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOver(false);
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    const data = JSON.parse(raw) as { taskId: number; srcColumnId: number; srcSwimlaneId: number; position: number };
    const position = taskBefore(event) + 1;
    if (data.srcColumnId === toInt(column.id) && data.srcSwimlaneId === toInt(swimlane.id) && data.position === position) return;
    props.onMove({ taskId: data.taskId, srcColumnId: data.srcColumnId, dstColumnId: toInt(column.id), dstSwimlaneId: toInt(swimlane.id), position });
  };
  return (
    <div
      className={`board-task-list board-column-expanded${props.compactVertical ? " board-task-list-compact" : ""}${over ? " board-drop-active" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setOver(true); }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={handleDrop}
    >
      {column.tasks.map((task) => (
        <TaskCard key={String(task.id)} task={task} collapsed={props.collapsedCards} highlightPeriod={props.highlightPeriod}
          saving={props.savingTaskId === toInt(task.id)}
          dragging={props.draggingTaskId === toInt(task.id)}
          onDragStart={(event) => {
            event.dataTransfer.setData("application/json", JSON.stringify({ taskId: toInt(task.id), srcColumnId: toInt(column.id), srcSwimlaneId: toInt(swimlane.id), position: toInt(task.position) }));
            props.onDragState(toInt(task.id));
          }}
          onDragEnd={() => props.onDragState(null)}
        />
      ))}
      {over && <div className="draggable-placeholder" aria-hidden="true" />}
    </div>
  );
}

export function TaskRow(props: TaskRowProps) {
  return (
    <tr className={`board-swimlane board-swimlane-tasks-${swimlaneId(props.swimlane)}${props.swimlane.task_limit && toInt(props.swimlane.nb_tasks) > toInt(props.swimlane.task_limit) ? " board-task-list-limit" : ""}`}>
      {props.swimlane.columns.map((column) => {
        const id = toInt(column.id);
        const hidden = props.hiddenColumns.has(id);
        return (
          <td key={id} className={`board-column-${id}${column.task_limit && toInt(column.column_nb_open_tasks) > toInt(column.task_limit) ? " board-task-list-limit" : ""}${hidden ? " board-column-task-collapsed" : ""}`}>
            {hidden ? <div className="board-column-collapsed board-rotation-wrapper"><button type="button" className="board-rotation" title={`Show ${column.title}`} onClick={() => props.onToggleColumn(id)}>＋ {column.title}</button></div> : <DropZone column={column} swimlane={props.swimlane} props={props} />}
          </td>
        );
      })}
    </tr>
  );
}

function swimlaneId(swimlane: BoardSwimlane): number {
  return toInt(swimlane.id);
}
