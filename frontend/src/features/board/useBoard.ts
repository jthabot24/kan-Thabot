import { useCallback, useEffect, useRef, useState } from "react";
import { getBoard, moveTaskPosition } from "../../api/procedures";
import type { BoardSwimlane } from "../../api/types";
import type { MoveTaskInput } from "./types";
import { toInt } from "./utils";

export interface UseBoardOptions {
  pollInterval: number;
}

export function useBoard(projectId: number, { pollInterval }: UseBoardOptions) {
  const [swimlanes, setSwimlanes] = useState<BoardSwimlane[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const lastServer = useRef<BoardSwimlane[]>([]);
  const serialized = useRef("");
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const refresh = useCallback(async () => {
    setLoading((value) => value && serialized.current === "");
    try {
      const result = await getBoard(projectId);
      const nextSerialized = JSON.stringify(result);
      if (nextSerialized !== serialized.current && mounted.current) {
        serialized.current = nextSerialized;
        lastServer.current = result;
        setSwimlanes(result);
      }
      if (mounted.current) setError(null);
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    serialized.current = "";
    lastServer.current = [];
    setSwimlanes([]);
    void refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !saving) void refresh();
    }, pollInterval * 1000);
    return () => window.clearInterval(interval);
  }, [pollInterval, projectId, refresh, saving]);

  const moveTask = useCallback(async (input: MoveTaskInput) => {
    const previous = swimlanes;
    const next = structuredClone(swimlanes);
    let moved = null as BoardSwimlane["columns"][number]["tasks"][number] | null;
    for (const lane of next) {
      for (const column of lane.columns) {
        const index = column.tasks.findIndex((task) => toInt(task.id) === input.taskId);
        if (index >= 0) moved = column.tasks.splice(index, 1)[0];
      }
    }
    if (!moved) return;
    const destination = next.find((lane) => toInt(lane.id) === input.dstSwimlaneId)?.columns
      .find((column) => toInt(column.id) === input.dstColumnId);
    if (!destination) return;
    moved.column_id = input.dstColumnId;
    moved.swimlane_id = input.dstSwimlaneId;
    destination.tasks.splice(Math.max(0, input.position - 1), 0, moved);
    setSwimlanes(next);
    setSaving(true);
    setError(null);
    try {
      await moveTaskPosition(
        projectId,
        input.taskId,
        input.dstColumnId,
        input.position,
        input.dstSwimlaneId,
      );
      await refresh();
    } catch (cause) {
      setSwimlanes(lastServer.current.length ? lastServer.current : previous);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  }, [projectId, refresh, swimlanes]);

  return { swimlanes, loading, error, refresh, moveTask, saving };
}
