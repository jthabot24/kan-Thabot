import type { BoardSwimlane, BoardTask } from "../../api/types";

export type BoardState = BoardSwimlane[];

export interface MoveTaskInput {
  taskId: number;
  srcColumnId: number;
  dstColumnId: number;
  dstSwimlaneId: number;
  position: number;
}

export interface DragData {
  taskId: number;
  srcColumnId: number;
  srcSwimlaneId: number;
  position: number;
}

export type TaskWithLocation = BoardTask & {
  location: { columnId: number; swimlaneId: number };
};
