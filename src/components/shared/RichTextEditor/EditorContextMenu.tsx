"use client";

import { useEffect, useState, useRef } from "react";
import type { Editor } from "@tiptap/react";
import type { Selection } from "@tiptap/pm/state";
import {
  Scissors,
  Copy,
  Clipboard,
  ClipboardPaste,
  Trash2,
  MessageSquarePlus,
  NotepadText,
  Columns2,
  Rows2,
  Merge,
  TableIcon,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──

interface MenuState {
  x: number;
  y: number;
  savedSelection: Selection;
  hasText: boolean;
  inTable: boolean;
  hasClipboard: boolean;
}

interface EditorContextMenuProps {
  editor: Editor;
  onAddComment?: (threadType: "comment" | "review_note") => void;
}

/** Clamp a position so the element stays within the viewport */
function clamp(click: number, size: number, viewport: number, pad = 8) {
  return click + size > viewport - pad
    ? Math.max(pad, viewport - size - pad)
    : click;
}

// ── Main component ──

export function EditorContextMenu({
  editor,
  onAddComment,
}: EditorContextMenuProps) {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [activeSub, setActiveSub] = useState<"table" | null>(null);
  const [subStyle, setSubStyle] = useState<React.CSSProperties>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const subTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Ref to hold selection captured on mousedown (before ProseMirror changes it)
  const savedSelRef = useRef<Selection | null>(null);

  // Save selection on right-click mousedown BEFORE ProseMirror processes it
  useEffect(() => {
    const el = editor.view.dom;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        // Right-click: snapshot selection now, before ProseMirror resets it
        savedSelRef.current = editor.state.selection;
      }
    };

    const handleContextMenu = async (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Use the selection we captured on mousedown (before ProseMirror changed it)
      const sel = savedSelRef.current ?? editor.state.selection;
      const { from, to } = sel;

      // Check clipboard content availability
      let hasClip = false;
      try {
        const text = await navigator.clipboard.readText();
        hasClip = text.length > 0;
      } catch {
        // Clipboard API denied or unavailable — hide paste
        hasClip = false;
      }

      setMenu({
        x: e.clientX,
        y: e.clientY,
        savedSelection: sel,
        hasText: from !== to || editor.isActive("table"),
        inTable: editor.isActive("table"),
        hasClipboard: hasClip,
      });
      setActiveSub(null);
    };

    // Capture phase so we run before ProseMirror's mousedown handler
    el.addEventListener("mousedown", handleMouseDown, true);
    el.addEventListener("contextmenu", handleContextMenu);
    return () => {
      el.removeEventListener("mousedown", handleMouseDown, true);
      el.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [editor]);

  // Restore saved selection + compute menu position after mount
  useEffect(() => {
    if (!menu) return;

    // Restore the selection that was active at the time of right-click
    const tr = editor.state.tr.setSelection(menu.savedSelection);
    editor.view.dispatch(tr);
    // Re-focus the editor so ProseMirror redraws CellSelection decorations (selectedCell highlight)
    editor.view.focus();

    // Position the menu after it's rendered (requestAnimationFrame ensures DOM is ready)
    requestAnimationFrame(() => {
      const el = menuRef.current;
      if (!el) return;
      setMenuStyle({
        left: clamp(menu.x, el.offsetWidth, window.innerWidth),
        top: clamp(menu.y, el.offsetHeight, window.innerHeight),
      });
    });
  }, [menu, editor]);

  // Compute submenu position when it opens
  useEffect(() => {
    if (!activeSub || !menu) return;
    requestAnimationFrame(() => {
      const menuEl = menuRef.current;
      const subEl = subRef.current;
      const triggerEl = menuEl?.querySelector<HTMLElement>(
        `[data-submenu-trigger="${activeSub}"]`,
      );
      if (!menuEl || !subEl || !triggerEl) return;

      const menuRect = menuEl.getBoundingClientRect();
      const triggerRect = triggerEl.getBoundingClientRect();
      const subW = subEl.offsetWidth;
      const subH = subEl.offsetHeight;
      const pad = 4;

      // Horizontal: try right of main menu, else left
      const rightSpace = window.innerWidth - menuRect.right;
      const x =
        rightSpace >= subW + pad
          ? menuRect.right - pad
          : menuRect.left - subW + pad;

      // Vertical: align with trigger, clamp to viewport
      const y = clamp(triggerRect.top, subH, window.innerHeight);

      setSubStyle({ left: x, top: y });
    });
  }, [activeSub, menu]);

  // Close on click outside or Escape
  useEffect(() => {
    if (!menu) return;

    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        (!subRef.current || !subRef.current.contains(e.target as Node))
      ) {
        setMenu(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    const handleScroll = () => setMenu(null);

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menu]);

  const close = () => setMenu(null);

  const exec = (fn: () => void) => {
    // Restore selection before executing action
    if (menu) {
      const tr = editor.state.tr.setSelection(menu.savedSelection);
      editor.view.dispatch(tr);
    }
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
  const handleDelete = () =>
    exec(() => editor.chain().focus().deleteSelection().run());

  // Submenu hover handlers with debounce to avoid flicker
  const openSub = (which: "table") => {
    clearTimeout(subTimeout.current);
    setActiveSub(which);
  };
  const closeSub = () => {
    subTimeout.current = setTimeout(() => setActiveSub(null), 200);
  };
  const keepSub = () => clearTimeout(subTimeout.current);

  if (!menu) return null;

  const { hasText, inTable } = menu;

  return (
    <>
      {/* ── Main context menu ── */}
      <div
        ref={menuRef}
        className="fixed z-50 min-w-[220px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
        style={menuStyle}
      >
        <MenuItem
          icon={Scissors}
          label="Cắt"
          shortcut="⌘X"
          onClick={handleCut}
          disabled={!hasText}
        />
        <MenuItem
          icon={Copy}
          label="Sao chép"
          shortcut="⌘C"
          onClick={handleCopy}
          disabled={!hasText}
        />
        {menu.hasClipboard && (
          <MenuItem
            icon={Clipboard}
            label="Dán"
            shortcut="⌘V"
            onClick={handlePasteRich}
          />
        )}
        {menu.hasClipboard && (
          <MenuItem
            icon={ClipboardPaste}
            label="Dán không định dạng"
            shortcut="⌘⇧V"
            onClick={handlePaste}
          />
        )}

        {/* Ý kiến + Review note — flat items */}
        {onAddComment && hasText && (
          <>
            <MenuDivider />
            <MenuItem
              icon={MessageSquarePlus}
              label="Ý kiến"
              onClick={() => exec(() => onAddComment("comment"))}
            />
            <MenuItem
              icon={NotepadText}
              label="Review note"
              onClick={() => exec(() => onAddComment("review_note"))}
              destructive
            />
          </>
        )}

        {/* Table — expandable submenu trigger */}
        {inTable && (
          <>
            <MenuDivider />
            <div
              data-submenu-trigger="table"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent",
                activeSub === "table" && "bg-accent",
              )}
              onMouseEnter={() => openSub("table")}
              onMouseLeave={closeSub}
            >
              <TableIcon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Bảng</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </>
        )}

        {/* Xóa — always at the bottom */}
        <MenuDivider />
        <MenuItem
          icon={Trash2}
          label="Xóa"
          onClick={handleDelete}
          disabled={!hasText}
        />
      </div>

      {/* ── Table submenu ── */}
      {activeSub === "table" && inTable && (
        <div
          ref={subRef}
          className="fixed z-[51] min-w-[200px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
          style={subStyle}
          onMouseEnter={keepSub}
          onMouseLeave={closeSub}
        >
          <MenuItem
            icon={Columns2}
            label="Thêm cột trước"
            onClick={() =>
              exec(() => editor.chain().focus().addColumnBefore().run())
            }
          />
          <MenuItem
            icon={Columns2}
            label="Thêm cột sau"
            onClick={() =>
              exec(() => editor.chain().focus().addColumnAfter().run())
            }
          />
          <MenuItem
            icon={Rows2}
            label="Thêm hàng trên"
            onClick={() =>
              exec(() => editor.chain().focus().addRowBefore().run())
            }
          />
          <MenuItem
            icon={Rows2}
            label="Thêm hàng dưới"
            onClick={() =>
              exec(() => editor.chain().focus().addRowAfter().run())
            }
          />
          <MenuDivider />
          <MenuItem
            icon={Merge}
            label="Gộp/Tách ô"
            onClick={() =>
              exec(() => editor.chain().focus().mergeOrSplit().run())
            }
          />
          <MenuDivider />
          <MenuItem
            icon={Columns2}
            label="Xóa cột"
            onClick={() =>
              exec(() => editor.chain().focus().deleteColumn().run())
            }
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
            onClick={() =>
              exec(() => editor.chain().focus().deleteTable().run())
            }
            destructive
          />
        </div>
      )}
    </>
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
        <span className="ml-auto text-xs text-muted-foreground">
          {shortcut}
        </span>
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 h-px bg-border" />;
}
