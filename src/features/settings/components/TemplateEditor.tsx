"use client";

import type { JSONContent } from "@tiptap/react";
import { EngageEditor } from "@/components/shared/RichTextEditor/EngageEditor";

interface TemplateEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
}

export function TemplateEditor({ content, onChange }: TemplateEditorProps) {
  return (
    <EngageEditor
      content={content}
      onChange={onChange}
      className="rounded-md border"
      editorClassName="min-h-[200px] px-4 py-3"
      placeholder="Nhập nội dung mẫu..."
    />
  );
}
