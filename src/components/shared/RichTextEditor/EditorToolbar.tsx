"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
  ImageIcon,
  TableIcon,
  Columns2,
  Rows2,
  Trash2,
  Paintbrush,
  HighlighterIcon,
  ChevronDown,
  Type,
  Pilcrow,
  Link as LinkIcon,
  ALargeSmall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TableGridPicker } from "./TableGridPicker";

// ── Constants ──

const TEXT_COLORS = [
  { label: "Mặc định", value: "" },
  { label: "Đỏ", value: "#dc2626" },
  { label: "Cam", value: "#ea580c" },
  { label: "Vàng", value: "#ca8a04" },
  { label: "Xanh lá", value: "#16a34a" },
  { label: "Xanh dương", value: "#2563eb" },
  { label: "Tím", value: "#9333ea" },
  { label: "Hồng", value: "#db2777" },
  { label: "Xám", value: "#6b7280" },
];

const HIGHLIGHT_COLORS = [
  { label: "Không", value: "" },
  { label: "Vàng", value: "#fef08a" },
  { label: "Xanh lá", value: "#bbf7d0" },
  { label: "Xanh dương", value: "#bfdbfe" },
  { label: "Tím", value: "#e9d5ff" },
  { label: "Hồng", value: "#fce7f3" },
  { label: "Cam", value: "#fed7aa" },
];

const FONT_FAMILIES = [
  { label: "Mặc định", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
];

const TEXT_STYLES = [
  { label: "Văn bản", value: "paragraph", icon: Pilcrow },
  { label: "Tiêu đề 1", value: "h1", icon: Heading1 },
  { label: "Tiêu đề 2", value: "h2", icon: Heading2 },
  { label: "Tiêu đề 3", value: "h3", icon: Heading3 },
];

const LINE_SPACINGS = [
  { label: "1.0", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "2.0", value: "2" },
  { label: "2.5", value: "2.5" },
];

// ── Props ──

interface EditorToolbarProps {
  editor: Editor;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function EditorToolbar({ editor, fileInputRef }: EditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  // ── Derived state ──
  const currentStyle = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : "paragraph";

  const currentStyleLabel =
    TEXT_STYLES.find((s) => s.value === currentStyle)?.label ?? "Văn bản";

  const currentFontLabel = (() => {
    const attrs = editor.getAttributes("textStyle");
    const ff = attrs?.fontFamily as string | undefined;
    if (!ff) return "Mặc định";
    return FONT_FAMILIES.find((f) => f.value === ff)?.label ?? "Mặc định";
  })();

  const applyTextStyle = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else if (value === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (value === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href }).run();
    }
    setLinkUrl("");
    setLinkOpen(false);
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b bg-background/95 backdrop-blur px-4 py-1.5">
      {/* ── Text style dropdown ── */}
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium hover:bg-accent transition-colors"
              title="Kiểu văn bản"
            />
          }
        >
          <Type className="h-3.5 w-3.5" />
          <span className="max-w-[60px] truncate">{currentStyleLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[160px] p-1" align="start">
          {TEXT_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors",
                currentStyle === s.value && "bg-accent font-medium",
              )}
              onClick={() => applyTextStyle(s.value)}
            >
              <s.icon className="h-4 w-4 text-muted-foreground" />
              {s.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* ── Font family dropdown ── */}
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium hover:bg-accent transition-colors"
              title="Phông chữ"
            />
          }
        >
          <span className="max-w-[70px] truncate">{currentFontLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-1" align="start">
          {FONT_FAMILIES.map((f) => (
            <button
              key={f.label}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors",
                currentFontLabel === f.label && "bg-accent font-medium",
              )}
              onClick={() => {
                if (f.value) {
                  editor.chain().focus().setFontFamily(f.value).run();
                } else {
                  editor.chain().focus().unsetFontFamily().run();
                }
              }}
            >
              {f.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* ── Bold / Italic / Underline ── */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarBtn>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* ── Text color ── */}
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
              title="Màu chữ"
            />
          }
        >
          <Paintbrush className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-5 gap-1">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                className={cn(
                  "h-6 w-6 rounded-md border transition-transform hover:scale-110",
                  !c.value && "bg-foreground",
                )}
                onClick={() => {
                  if (c.value) {
                    editor.chain().focus().setColor(c.value).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                }}
              >
                {c.value && (
                  <span
                    className="block h-full w-full rounded-md"
                    style={{ backgroundColor: c.value }}
                  />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* ── Highlight color ── */}
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
              title="Tô sáng"
            />
          }
        >
          <HighlighterIcon className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                className={cn(
                  "h-6 w-6 rounded-md border transition-transform hover:scale-110",
                  !c.value && "bg-background",
                )}
                onClick={() => {
                  if (c.value) {
                    editor
                      .chain()
                      .focus()
                      .toggleHighlight({ color: c.value })
                      .run();
                  } else {
                    editor.chain().focus().unsetHighlight().run();
                  }
                }}
              >
                {c.value ? (
                  <span
                    className="block h-full w-full rounded-md"
                    style={{ backgroundColor: c.value }}
                  />
                ) : (
                  <span className="block text-xs leading-6 text-center text-muted-foreground">
                    ✕
                  </span>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* ── Lists ── */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarBtn>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* ── Line spacing ── */}
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
              title="Giãn dòng"
            />
          }
        >
          <ALargeSmall className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent className="w-[100px] p-1" align="start">
          {LINE_SPACINGS.map((ls) => (
            <button
              key={ls.value}
              type="button"
              className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
              onClick={() => {
                editor.chain().focus().setLineHeight(ls.value).run();
              }}
            >
              {ls.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* ── Link ── */}
      <Popover
        open={linkOpen}
        onOpenChange={(open) => {
          setLinkOpen(open);
          if (open) {
            setLinkUrl(editor.getAttributes("link").href || "");
          }
        }}
      >
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors",
                editor.isActive("link") && "bg-accent text-accent-foreground",
              )}
              title="Chèn liên kết"
            />
          }
        >
          <LinkIcon className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-2 p-3" align="start">
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSetLink();
              }
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={handleSetLink}>
              {editor.isActive("link") ? "Cập nhật" : "Chèn"}
            </Button>
            {editor.isActive("link") && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setLinkUrl("");
                  setLinkOpen(false);
                }}
              >
                Xóa link
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* ── Table controls ── */}
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors",
                editor.isActive("table") && "bg-accent text-accent-foreground",
              )}
              title="Bảng"
            />
          }
        >
          <TableIcon className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1" align="start">
          {!editor.isActive("table") ? (
            <TableGridPicker
              onSelect={(rows, cols) =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows, cols, withHeaderRow: true })
                  .run()
              }
            />
          ) : (
            <>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                <Columns2 className="h-4 w-4 text-muted-foreground" />
                Thêm cột
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                <Rows2 className="h-4 w-4 text-muted-foreground" />
                Thêm hàng
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                <Columns2 className="h-4 w-4 text-destructive" />
                Xóa cột
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                <Rows2 className="h-4 w-4 text-destructive" />
                Xóa hàng
              </button>
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-accent transition-colors"
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                <Trash2 className="h-4 w-4" />
                Xóa bảng
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>

      <ToolbarBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Minus className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => fileInputRef.current?.click()}
        title="Chèn hình ảnh"
      >
        <ImageIcon className="h-4 w-4" />
      </ToolbarBtn>

      {/* ── Undo / Redo ── */}
      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarBtn>
      </div>
    </div>
  );
}

// ── Small toolbar button ──

function ToolbarBtn({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", active && "bg-accent text-accent-foreground")}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}
