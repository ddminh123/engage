"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const MAX_ROWS = 8;
const MAX_COLS = 8;

interface TableGridPickerProps {
  onSelect: (rows: number, cols: number) => void;
}

export function TableGridPicker({ onSelect }: TableGridPickerProps) {
  const [hover, setHover] = useState({ row: 0, col: 0 });

  const handleMouseEnter = useCallback((row: number, col: number) => {
    setHover({ row, col });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover({ row: 0, col: 0 });
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5 p-1.5">
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: MAX_ROWS }, (_, r) =>
          Array.from({ length: MAX_COLS }, (_, c) => {
            const row = r + 1;
            const col = c + 1;
            const active = row <= hover.row && col <= hover.col;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className={cn(
                  "h-4 w-4 rounded-[2px] border transition-colors",
                  active
                    ? "border-primary/60 bg-primary/20"
                    : "border-border bg-background hover:border-muted-foreground/30",
                )}
                onMouseEnter={() => handleMouseEnter(row, col)}
                onClick={() => onSelect(row, col)}
                title={`${col} × ${row}`}
              />
            );
          }),
        )}
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {hover.row > 0 ? `${hover.col} × ${hover.row}` : "Chọn kích thước bảng"}
      </span>
    </div>
  );
}
