"use client";

import { Pencil, Trash2, Copy, ArrowRightLeft } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface WpContextMenuProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove?: () => void;
  showMove?: boolean;
}

export function WpContextMenu({
  children,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  showMove = true,
}: WpContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuGroup>
          <ContextMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Chỉnh sửa
          </ContextMenuItem>
          <ContextMenuItem onClick={onDuplicate}>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Nhân bản
          </ContextMenuItem>
          {showMove && onMove && (
            <ContextMenuItem onClick={onMove}>
              <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
              Chuyển đến...
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Xóa
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
