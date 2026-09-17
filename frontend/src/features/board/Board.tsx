import { Fragment, useEffect, useMemo, useState } from "react";
import { useBoard } from "./useBoard";
import { BoardToolbar } from "./BoardToolbar";
import { ColumnHeaderRow } from "./ColumnHeaderRow";
import { SwimlaneRow } from "./SwimlaneRow";
import { TaskRow } from "./TaskRow";
import {
  getHiddenSwimlanes, isBoardCollapsed, isCompactHorizontal, isCompactVertical,
  isColumnHidden, resetSingleSwimlane, setBoardCollapsed, setCompactHorizontal,
  setCompactVertical, toggleHiddenSwimlane,
} from "./preferences";
import { toInt } from "./utils";
import type { MoveTaskInput } from "./types";
import "./board.css";

interface BoardProps {
  projectId: number;
  pollInterval: number;
  highlightPeriod?: number;
}

export function Board({ projectId, pollInterval, highlightPeriod = 172800 }: BoardProps) {
  const { swimlanes, loading, error, refresh, moveTask, saving } = useBoard(projectId, { pollInterval });
  const [collapsedCards, setCollapsedCards] = useState(() => isBoardCollapsed(projectId));
  const [compactHorizontal, setCompactHorizontalState] = useState(isCompactHorizontal);
  const [compactVertical, setCompactVerticalState] = useState(isCompactVertical);
  const [hiddenColumns, setHiddenColumns] = useState<Set<number>>(() => new Set());
  const [hiddenSwimlanes, setHiddenSwimlanesState] = useState<number[]>(() => getHiddenSwimlanes(projectId));
  const [savingTaskId, setSavingTaskId] = useState<number | null>(null);
  useEffect(() => {
    setHiddenColumns(new Set(swimlanes.flatMap((lane) => lane.columns.map((column) => toInt(column.id)).filter(isColumnHidden))));
    setHiddenSwimlanesState(getHiddenSwimlanes(projectId));
    resetSingleSwimlane(projectId, swimlanes.length);
  }, [projectId, swimlanes]);
  const visible = useMemo(() => swimlanes.filter((lane) => !hiddenSwimlanes.includes(toInt(lane.id))), [hiddenSwimlanes, swimlanes]);
  const toggleColumn = (id: number) => {
    const next = new Set(hiddenColumns);
    const hide = !next.has(id);
    if (hide) next.add(id); else next.delete(id);
    setHiddenColumns(next);
    localStorage.setItem(`hidden_column_${id}`, hide ? "1" : "");
    if (!hide) localStorage.removeItem(`hidden_column_${id}`);
  };
  const toggleSwimlane = (id: number) => {
    const next = toggleHiddenSwimlane(projectId, id);
    setHiddenSwimlanesState(next);
  };
  const move = async (input: MoveTaskInput) => {
    setSavingTaskId(input.taskId);
    await moveTask(input);
    setSavingTaskId(null);
  };
  return (
    <section className="board-shell">
      <BoardToolbar collapsed={collapsedCards} compactHorizontal={compactHorizontal} compactVertical={compactVertical}
        onRefresh={() => void refresh()}
        onCollapsedChange={(value) => { setCollapsedCards(value); setBoardCollapsed(projectId, value); }}
        onHorizontalChange={(value) => { setCompactHorizontalState(value); setCompactHorizontal(value); }}
        onVerticalChange={(value) => { setCompactVerticalState(value); setCompactVertical(value); }} />
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {loading && <p role="status">Loading board…</p>}
      {!loading && (swimlanes.length === 0 || swimlanes[0].columns.length === 0) && <p className="alert alert-error">There is no column or swimlane activated in your project!</p>}
      {swimlanes.length > 0 && swimlanes[0].columns.length > 0 && (
        <div id="board-container" className={compactHorizontal ? "board-container-compact" : ""}>
          <table id="board">
            <tbody>
              {visible.map((swimlane) => {
                const id = toInt(swimlane.id);
                const hidden = hiddenSwimlanes.includes(id);
                return (
                  <Fragment key={id}>
                    {swimlanes.length > 1 && <SwimlaneRow swimlane={swimlane} hidden={hidden} onToggle={() => toggleSwimlane(id)} />}
                    {!hidden && <ColumnHeaderRow swimlane={swimlane} hiddenColumns={hiddenColumns} compact={compactHorizontal} onToggleColumn={toggleColumn} />}
                    {!hidden && <TaskRow swimlane={swimlane} hiddenColumns={hiddenColumns} compactVertical={compactVertical} collapsedCards={collapsedCards} highlightPeriod={highlightPeriod} savingTaskId={saving ? savingTaskId : null} onMove={(input) => void move(input)} onDragState={setSavingTaskId} onToggleColumn={toggleColumn} />}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
