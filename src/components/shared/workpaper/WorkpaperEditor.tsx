"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { Image } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import type { JSONContent, Editor } from "@tiptap/react";
import { LineHeight } from "@/components/shared/RichTextEditor/extensions/LineHeight";
import { MessageSquarePlus, NotepadText } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "@/components/shared/RichTextEditor/EditorToolbar";
import { EditorContextMenu } from "@/components/shared/RichTextEditor/EditorContextMenu";
import { CommentMark } from "./extensions/CommentMark";
import type { WpThreadType } from "@/features/engagement/types";

export interface WorkpaperEditorHandle {
  getEditor: () => Editor | null;
  highlightThread: (threadId: string | null) => void;
  applyCommentMark: (
    threadId: string,
    threadType: string,
    from: number,
    to: number,
  ) => void;
}

interface WorkpaperEditorProps {
  content: JSONContent | null;
  onChange: (content: JSONContent) => void;
  onCommentActivated: (threadId: string | null) => void;
  onCommentClicked: (threadId: string) => void;
  onAddComment: (
    quote: string,
    threadType: WpThreadType,
    from: number,
    to: number,
  ) => void;
  readOnly?: boolean;
  className?: string;
}

export const WorkpaperEditor = forwardRef<
  WorkpaperEditorHandle,
  WorkpaperEditorProps
>(function WorkpaperEditorInner(
  {
    content,
    onChange,
    onCommentActivated,
    onCommentClicked,
    onAddComment,
    readOnly = false,
    className,
  },
  ref,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: "Bắt đầu nhập nội dung..." }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true, allowTableNodeSelection: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      LineHeight,
      CommentMark.configure({
        HTMLAttributes: {},
        onCommentActivated,
        onCommentClicked,
      }),
    ],
    content: content ?? undefined,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onChange(e.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[calc(100vh-200px)] px-6 py-4",
        translate: "no",
      },
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => editor,
      highlightThread: (threadId: string | null) => {
        if (editor) {
          editor.commands.highlightThread(threadId);
        }
      },
      applyCommentMark: (
        threadId: string,
        threadType: string,
        from: number,
        to: number,
      ) => {
        if (editor) {
          editor
            .chain()
            .setTextSelection({ from, to })
            .setComment(threadId, threadType)
            .run();
        }
      },
    }),
    [editor],
  );

  useEffect(() => {
    if (editor && readOnly !== !editor.isEditable) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

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

  const handleAddComment = (threadType: WpThreadType) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const quote = editor.state.doc.textBetween(from, to, " ");
    onAddComment(quote, threadType, from, to);
  };

  if (!editor) return null;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Sticky toolbar */}
      {!readOnly && (
        <EditorToolbar editor={editor} fileInputRef={fileInputRef} />
      )}

      {/* Bubble menu — only Comment / Review note with icons */}
      {!readOnly && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "top", offset: 8 }}
          shouldShow={({ editor: e }) => {
            // Show for any non-empty selection (text or cell)
            const { from, to } = e.state.selection;
            return from !== to;
          }}
          className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-lg"
        >
          <BubbleButton
            onClick={() => handleAddComment("comment")}
            title="Thêm ý kiến"
            className="text-blue-600 hover:text-blue-700"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span className="text-xs ml-1">Ý kiến</span>
          </BubbleButton>
          <BubbleButton
            onClick={() => handleAddComment("review_note")}
            title="Thêm review note"
            className="text-orange-600 hover:text-orange-700"
          >
            <NotepadText className="h-3.5 w-3.5" />
            <span className="text-xs ml-1">Review note</span>
          </BubbleButton>
        </BubbleMenu>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        title="Upload image"
        onChange={handleImageUpload}
      />

      <EditorContent editor={editor} className="flex-1" />

      {/* Right-click context menu */}
      {!readOnly && (
        <EditorContextMenu
          editor={editor}
          onAddComment={(type: "comment" | "review_note") =>
            handleAddComment(type)
          }
        />
      )}
    </div>
  );
});

// Re-export editor ref for parent access
export type { Editor };

function BubbleButton({
  children,
  onClick,
  active,
  title,
  className: cls,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center rounded px-1.5 py-1 transition-colors hover:bg-accent",
        active && "bg-accent text-accent-foreground",
        cls,
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
