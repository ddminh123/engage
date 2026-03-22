"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { Image } from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Minus,
  Table as TableIcon,
  Paintbrush,
  Highlighter,
  ImageIcon,
  Trash2,
  Plus,
  Columns,
  Rows,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const TEXT_COLORS = [
  { label: "Mặc định", value: "" },
  { label: "Đỏ", value: "#dc2626" },
  { label: "Cam", value: "#ea580c" },
  { label: "Vàng", value: "#ca8a04" },
  { label: "Xanh lá", value: "#16a34a" },
  { label: "Xanh dương", value: "#2563eb" },
  { label: "Tím", value: "#9333ea" },
  { label: "Xám", value: "#6b7280" },
];

const HIGHLIGHT_COLORS = [
  { label: "Không", value: "" },
  { label: "Vàng", value: "#fef08a" },
  { label: "Xanh lá", value: "#bbf7d0" },
  { label: "Xanh dương", value: "#bfdbfe" },
  { label: "Hồng", value: "#fbcfe8" },
  { label: "Cam", value: "#fed7aa" },
  { label: "Tím", value: "#e9d5ff" },
];

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  /** Compact mode — hides toolbar, minimal height */
  slim?: boolean;
  /** Auto-focus the editor on mount */
  autoFocus?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Nhập nội dung...",
  className,
  editable = true,
  slim = false,
  autoFocus = false,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: slim ? false : { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      ...(slim
        ? []
        : [
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
          ]),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: slim
          ? "prose prose-sm max-w-none focus:outline-none min-h-[36px] px-3 py-1.5 text-sm"
          : "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  // Auto-focus the editor on mount when requested
  useEffect(() => {
    if (autoFocus && editor && editable) {
      editor.commands.focus("end");
    }
  }, [autoFocus, editor, editable]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!editor) return null;

  return (
    <div className={cn("rounded-lg border bg-background", className)}>
      {editable && !slim && (
        <>
          <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
            {/* ── Text formatting ── */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* ── Headings ── */}
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* ── Lists ── */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Bullet list"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Numbered list"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* ── Color picker ── */}
            <ColorPicker
              icon={<Paintbrush className="h-4 w-4" />}
              title="Màu chữ"
              colors={TEXT_COLORS}
              activeColor={editor.getAttributes("textStyle").color || ""}
              onSelect={(color) => {
                if (color) {
                  editor.chain().focus().setColor(color).run();
                } else {
                  editor.chain().focus().unsetColor().run();
                }
              }}
            />
            <ColorPicker
              icon={<Highlighter className="h-4 w-4" />}
              title="Highlight"
              colors={HIGHLIGHT_COLORS}
              activeColor={editor.getAttributes("highlight").color || ""}
              onSelect={(color) => {
                if (color) {
                  editor.chain().focus().toggleHighlight({ color }).run();
                } else {
                  editor.chain().focus().unsetHighlight().run();
                }
              }}
            />

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* ── Table ── */}
            <TableMenu editor={editor} />

            {/* ── Horizontal rule ── */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal rule"
            >
              <Minus className="h-4 w-4" />
            </ToolbarButton>

            {/* ── Image upload ── */}
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              title="Chèn hình ảnh"
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* ── Undo / Redo ── */}
            <div className="ml-auto flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </ToolbarButton>
            </div>
          </div>
        </>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

// Read-only HTML renderer (no editor overhead)
export function RichTextDisplay({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// Small toolbar button
function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("h-7 w-7", active && "bg-accent text-accent-foreground")}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

// ── Color picker popover ──
function ColorPicker({
  icon,
  title,
  colors,
  activeColor,
  onSelect,
}: {
  icon: ReactNode;
  title: string;
  colors: { label: string; value: string }[];
  activeColor: string;
  onSelect: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <ToolbarButton
        onClick={() => setOpen((o) => !o)}
        active={!!activeColor}
        title={title}
      >
        {icon}
      </ToolbarButton>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 rounded-lg border bg-popover p-2 shadow-md">
            <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
              {title}
            </p>
            <div className="grid grid-cols-4 gap-1">
              {colors.map((c) => (
                <button
                  key={c.value || "_none"}
                  type="button"
                  title={c.label}
                  className={cn(
                    "h-6 w-6 rounded-md border transition-all hover:scale-110",
                    activeColor === c.value &&
                      "ring-2 ring-primary ring-offset-1",
                    !c.value && "bg-background",
                  )}
                  style={c.value ? { backgroundColor: c.value } : undefined}
                  onClick={() => {
                    onSelect(c.value);
                    setOpen(false);
                  }}
                >
                  {!c.value && (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      ✕
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Table menu popover ──
function TableMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const isInTable = editor.isActive("table");

  return (
    <div className="relative">
      <ToolbarButton
        onClick={() => {
          if (!isInTable) {
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run();
          } else {
            setOpen((o) => !o);
          }
        }}
        active={isInTable}
        title={isInTable ? "Tùy chọn bảng" : "Chèn bảng (3×3)"}
      >
        <TableIcon className="h-4 w-4" />
      </ToolbarButton>
      {open && isInTable && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border bg-popover p-1 shadow-md">
            <TableMenuItem
              icon={<Plus className="h-3.5 w-3.5" />}
              label="Thêm cột trước"
              onClick={() => {
                editor.chain().focus().addColumnBefore().run();
                setOpen(false);
              }}
            />
            <TableMenuItem
              icon={<Plus className="h-3.5 w-3.5" />}
              label="Thêm cột sau"
              onClick={() => {
                editor.chain().focus().addColumnAfter().run();
                setOpen(false);
              }}
            />
            <TableMenuItem
              icon={<Columns className="h-3.5 w-3.5" />}
              label="Xóa cột"
              onClick={() => {
                editor.chain().focus().deleteColumn().run();
                setOpen(false);
              }}
              destructive
            />
            <Separator className="my-1" />
            <TableMenuItem
              icon={<Plus className="h-3.5 w-3.5" />}
              label="Thêm hàng trước"
              onClick={() => {
                editor.chain().focus().addRowBefore().run();
                setOpen(false);
              }}
            />
            <TableMenuItem
              icon={<Plus className="h-3.5 w-3.5" />}
              label="Thêm hàng sau"
              onClick={() => {
                editor.chain().focus().addRowAfter().run();
                setOpen(false);
              }}
            />
            <TableMenuItem
              icon={<Rows className="h-3.5 w-3.5" />}
              label="Xóa hàng"
              onClick={() => {
                editor.chain().focus().deleteRow().run();
                setOpen(false);
              }}
              destructive
            />
            <Separator className="my-1" />
            <TableMenuItem
              icon={<Trash2 className="h-3.5 w-3.5" />}
              label="Xóa bảng"
              onClick={() => {
                editor.chain().focus().deleteTable().run();
                setOpen(false);
              }}
              destructive
            />
          </div>
        </>
      )}
    </div>
  );
}

function TableMenuItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
        destructive && "text-destructive hover:bg-destructive/10",
      )}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
