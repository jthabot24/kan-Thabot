interface BoardToolbarProps {
  collapsed: boolean;
  compactHorizontal: boolean;
  compactVertical: boolean;
  onRefresh: () => void;
  onCollapsedChange: (value: boolean) => void;
  onHorizontalChange: (value: boolean) => void;
  onVerticalChange: (value: boolean) => void;
}

export function BoardToolbar({
  collapsed,
  compactHorizontal,
  compactVertical,
  onRefresh,
  onCollapsedChange,
  onHorizontalChange,
  onVerticalChange,
}: BoardToolbarProps) {
  return (
    <div className="board-toolbar" role="toolbar" aria-label="Board controls">
      <button type="button" onClick={onRefresh}>↻ Refresh</button>
      <button type="button" onClick={() => onCollapsedChange(!collapsed)}>
        {collapsed ? "▣ Expand cards" : "▤ Collapse cards"}
      </button>
      <button type="button" onClick={() => onHorizontalChange(!compactHorizontal)}>
        {compactHorizontal ? "↔ Wide columns" : "↕ Compact columns"}
      </button>
      <button type="button" onClick={() => onVerticalChange(!compactVertical)}>
        {compactVertical ? "↕ Expand lists" : "↕ Compact lists"}
      </button>
    </div>
  );
}
