"use client";

import { Copy, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WpBatchBarProps {
  count: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onClear: () => void;
  isPending: boolean;
}

export function WpBatchBar({
  count,
  onDuplicate,
  onDelete,
  onClear,
  isPending,
}: WpBatchBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm">
      <span className="font-medium">{count} đã chọn</span>
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={onDuplicate}
          disabled={isPending}
        >
          <Copy className="mr-1 h-3 w-3" />
          Nhân bản
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={isPending}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Xóa
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
