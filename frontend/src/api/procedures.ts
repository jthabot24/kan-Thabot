import { rpc } from "./client";
import type {
  BoardSwimlane,
  Column,
  Project,
  Swimlane,
  User,
} from "./types";

export const getBoard = (projectId: number) =>
  rpc<BoardSwimlane[]>("getBoard", { project_id: projectId });

export const getColumns = (projectId: number) =>
  rpc<Column[]>("getColumns", { project_id: projectId });

export const getActiveSwimlanes = (projectId: number) =>
  rpc<Swimlane[]>("getActiveSwimlanes", { project_id: projectId });

export const getProjectById = (projectId: number) =>
  rpc<Project>("getProjectById", { project_id: projectId });

export const moveTaskPosition = (
  projectId: number,
  taskId: number,
  columnId: number,
  position: number,
  swimlaneId: number,
) =>
  rpc<boolean>("moveTaskPosition", {
    project_id: projectId,
    task_id: taskId,
    column_id: columnId,
    position,
    swimlane_id: swimlaneId,
  });

export const getMe = () => rpc<User>("getMe");
