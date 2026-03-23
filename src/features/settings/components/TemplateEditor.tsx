"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import { LineHeight } from "@/components/shared/RichTextEditor/extensions/LineHeight";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "@/components/shared/RichTextEditor/EditorToolbar";
import { EditorContextMenu } from "@/components/shared/RichTextEditor/EditorContextMenu";

interface TemplateEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
}

export function TemplateEditor({ content, onChange }: TemplateEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: "Nhập nội dung mẫu..." }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      LineHeight,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onChange(e.getJSON());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none dark:prose-invert",
          "min-h-[200px] px-4 py-3 focus:outline-none",
        ),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentJSON = JSON.stringify(editor.getJSON());
    const newJSON = JSON.stringify(content);
    if (currentJSON !== newJSON) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

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
    <div className="rounded-md border">
      <EditorToolbar editor={editor} fileInputRef={fileInputRef} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        title="Upload image"
        onChange={handleImageUpload}
      />
      <EditorContent editor={editor} />
      <EditorContextMenu editor={editor} />
    </div>
  );
}
