"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent, Editor, AnyExtension } from "@tiptap/react";
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
import { LineHeight } from "./extensions/LineHeight";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./EditorToolbar";
import { EditorContextMenu } from "./EditorContextMenu";

// ── Public handle exposed via ref ──

export interface EngageEditorHandle {
  getEditor: () => Editor | null;
}

// ── Props ──

export interface EngageEditorProps {
  content: JSONContent | null;
  onChange: (content: JSONContent) => void;
  readOnly?: boolean;
  className?: string;
  /** CSS class for the editor content area (inside EditorContent) */
  editorClassName?: string;
  placeholder?: string;
  /** Additional Tiptap extensions (e.g. CommentMark) appended after the base set */
  extraExtensions?: AnyExtension[];
  /** If provided, context menu shows Ý kiến + Review note items */
  onAddComment?: (threadType: "comment" | "review_note") => void;
}

// ── Base extensions shared by every editor instance ──

function buildBaseExtensions(placeholder: string): AnyExtension[] {
  return [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Placeholder.configure({ placeholder }),
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
  ];
}

// ── Component ──

export const EngageEditor = forwardRef<EngageEditorHandle, EngageEditorProps>(
  function EngageEditorInner(
    {
      content,
      onChange,
      readOnly = false,
      className,
      editorClassName,
      placeholder = "Bắt đầu nhập nội dung...",
      extraExtensions,
      onAddComment,
    },
    ref,
  ) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
      extensions: [
        ...buildBaseExtensions(placeholder),
        ...(extraExtensions ?? []),
      ],
      content: content ?? undefined,
      editable: !readOnly,
      immediatelyRender: false,
      onUpdate: ({ editor: e }) => {
        onChange(e.getJSON());
      },
      editorProps: {
        attributes: {
          class: cn(
            "notranslate prose prose-sm max-w-none focus:outline-none min-h-[200px] px-6 py-4",
            editorClassName,
          ),
          translate: "no",
        },
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        getEditor: () => editor,
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

    if (!editor) return null;

    return (
      <div className={cn("flex flex-col", className)}>
        {!readOnly && (
          <EditorToolbar editor={editor} fileInputRef={fileInputRef} />
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

        {!readOnly && (
          <EditorContextMenu editor={editor} onAddComment={onAddComment} />
        )}
      </div>
    );
  },
);

// Re-export for convenience
export type { Editor, JSONContent };
