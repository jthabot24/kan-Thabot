import type { BoardSwimlane } from "../../api/types";
import { ColumnHeader } from "./ColumnHeader";

interface ColumnHeaderRowProps {
  swimlane: BoardSwimlane;
  hiddenColumns: Set<number>;
  compact: boolean;
  onToggleColumn: (id: number) => void;
}

export function ColumnHeaderRow({ swimlane, hiddenColumns, compact, onToggleColumn }: ColumnHeaderRowProps) {
  return (
    <tr className={`board-swimlane-columns-${swimlane.id}`}>
      {swimlane.columns.map((column) => {
        const id = Number(column.id);
        return <ColumnHeader key={id} column={column} hidden={hiddenColumns.has(id)} compact={compact} onToggle={() => onToggleColumn(id)} />;
      })}
    </tr>
  );
}
