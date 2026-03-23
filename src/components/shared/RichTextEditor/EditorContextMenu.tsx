"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import {
  Scissors,
  Copy,
  Clipboard,
  ClipboardPaste,
  Trash2,
  MessageSquarePlus,
  Columns2,
  Rows2,
  Merge,
  SplitSquareHorizontal,
  TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuPosition {
  x: number;
  y: number;
}

interface EditorContextMenuProps {
  editor: Editor;
  onAddComment?: () => void;
}

export function EditorContextMenu({ editor, onAddComment }: EditorContextMenuProps) {
  const [pos, setPos] = useState<MenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasSelection = useCallback(() => {
    const { from, to } = editor.state.selection;
    return from !== to;
  }, [editor]);

  const inTable = useCallback(() => {
    return editor.isActive("table");
  }, [editor]);

  // Listen for contextmenu on the editor DOM
  useEffect(() => {
    const el = editor.view.dom;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setPos({ x: e.clientX, y: e.clientY });
    };

    el.addEventListener("contextmenu", handleContextMenu);
    return () => el.removeEventListener("contextmenu", handleContextMenu);
  }, [editor]);

  // Close on click outside or Escape
  useEffect(() => {
    if (!pos) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setPos(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPos(null);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [pos]);

  const close = () => setPos(null);

  const exec = (fn: () => void) => {
    fn();
    close();
  };

  const handleCut = () => exec(() => document.execCommand("cut"));
  const handleCopy = () => exec(() => document.execCommand("copy"));
  const handlePaste = () =>
    exec(() => {
      navigator.clipboard.readText().then((t) => {
        editor.chain().focus().insertContent(t).run();
      });
    });
  const handlePasteRich = () => exec(() => document.execCommand("paste"));
  const handleDelete = () => exec(() => editor.chain().focus().deleteSelection().run());

  if (!pos) return null;

  const selected = hasSelection();
  const tableActive = inTable();

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[220px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* ── Basic text operations ── */}
      <MenuItem icon={Scissors} label="Cắt" shortcut="⌘X" onClick={handleCut} disabled={!selected} />
      <MenuItem icon={Copy} label="Sao chép" shortcut="⌘C" onClick={handleCopy} disabled={!selected} />
      <MenuItem icon={Clipboard} label="Dán" shortcut="⌘V" onClick={handlePasteRich} />
      <MenuItem icon={ClipboardPaste} label="Dán không định dạng" shortcut="⌘⇧V" onClick={handlePaste} />
      <MenuDivider />
      <MenuItem icon={Trash2} label="Xóa" onClick={handleDelete} disabled={!selected} />

      {/* ── Comment (only when comments enabled + text selected) ── */}
      {onAddComment && selected && (
        <>
          <MenuDivider />
          <MenuItem
            icon={MessageSquarePlus}
            label="Bình luận"
            shortcut="⌘⌥M"
            onClick={() => exec(() => onAddComment())}
          />
        </>
      )}

      {/* ── Table operations (only when cursor is inside a table) ── */}
      {tableActive && (
        <>
          <MenuDivider />
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bảng
          </div>
          <MenuItem
            icon={Columns2}
            label="Thêm cột trước"
            onClick={() => exec(() => editor.chain().focus().addColumnBefore().run())}
          />
          <MenuItem
            icon={Columns2}
            label="Thêm cột sau"
            onClick={() => exec(() => editor.chain().focus().addColumnAfter().run())}
          />
          <MenuItem
            icon={Rows2}
            label="Thêm hàng trên"
            onClick={() => exec(() => editor.chain().focus().addRowBefore().run())}
          />
          <MenuItem
            icon={Rows2}
            label="Thêm hàng dưới"
            onClick={() => exec(() => editor.chain().focus().addRowAfter().run())}
          />
          <MenuDivider />
          <MenuItem
            icon={Merge}
            label="Gộp ô"
            onClick={() => exec(() => editor.chain().focus().mergeCells().run())}
          />
          <MenuItem
            icon={SplitSquareHorizontal}
            label="Tách ô"
            onClick={() => exec(() => editor.chain().focus().splitCell().run())}
          />
          <MenuDivider />
          <MenuItem
            icon={Columns2}
            label="Xóa cột"
            onClick={() => exec(() => editor.chain().focus().deleteColumn().run())}
            destructive
          />
          <MenuItem
            icon={Rows2}
            label="Xóa hàng"
            onClick={() => exec(() => editor.chain().focus().deleteRow().run())}
            destructive
          />
          <MenuItem
            icon={TableIcon}
            label="Xóa bảng"
            onClick={() => exec(() => editor.chain().focus().deleteTable().run())}
            destructive
          />
        </>
      )}
    </div>
  );
}

// ── Helpers ──

function MenuItem({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled,
  destructive,
}: {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        disabled
          ? "cursor-default text-muted-foreground/50"
          : destructive
            ? "text-destructive hover:bg-destructive/10"
            : "hover:bg-accent",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="ml-auto text-xs text-muted-foreground">{shortcut}</span>
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 h-px bg-border" />;
}
