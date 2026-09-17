function key(name: string, value: number): string {
  return `${name}_${value}`;
}

export function isColumnHidden(columnId: number): boolean {
  return localStorage.getItem(key("hidden_column", columnId)) !== null;
}

export function setColumnHidden(columnId: number, hidden: boolean): void {
  if (hidden) localStorage.setItem(key("hidden_column", columnId), "1");
  else localStorage.removeItem(key("hidden_column", columnId));
}

export function getHiddenSwimlanes(projectId: number): number[] {
  const value = localStorage.getItem(key("hidden_swimlanes", projectId));
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

export function setHiddenSwimlanes(projectId: number, ids: number[]): void {
  if (ids.length === 0) localStorage.removeItem(key("hidden_swimlanes", projectId));
  else localStorage.setItem(key("hidden_swimlanes", projectId), JSON.stringify(ids));
}

export function toggleHiddenSwimlane(projectId: number, swimlaneId: number): number[] {
  const ids = getHiddenSwimlanes(projectId);
  const next = ids.includes(swimlaneId)
    ? ids.filter((id) => id !== swimlaneId)
    : [...ids, swimlaneId];
  setHiddenSwimlanes(projectId, next);
  return next;
}

export function resetSingleSwimlane(projectId: number, count: number): void {
  if (count <= 1) setHiddenSwimlanes(projectId, []);
}

export function isCompactHorizontal(): boolean {
  return localStorage.getItem("horizontal_scroll") === "0";
}

export function setCompactHorizontal(compact: boolean): void {
  localStorage.setItem("horizontal_scroll", compact ? "0" : "1");
}

export function isCompactVertical(): boolean {
  return localStorage.getItem("vertical_scroll") === "0";
}

export function setCompactVertical(compact: boolean): void {
  localStorage.setItem("vertical_scroll", compact ? "0" : "1");
}

export function isBoardCollapsed(projectId: number): boolean {
  return localStorage.getItem(key("board_collapsed", projectId)) === "1";
}

export function setBoardCollapsed(projectId: number, collapsed: boolean): void {
  if (collapsed) localStorage.setItem(key("board_collapsed", projectId), "1");
  else localStorage.removeItem(key("board_collapsed", projectId));
}
