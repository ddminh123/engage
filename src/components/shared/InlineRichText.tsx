"use client";

import * as React from "react";
import { RichTextEditor, RichTextDisplay } from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InlineRichTextProps {
  /** Unique field name used for single-editor-at-a-time coordination */
  name: string;
  /** Section label shown above the content */
  label: string;
  /** HTML content */
  content: string | null;
  /** Called with new HTML when user edits */
  onChange: (html: string) => void;
  /** Placeholder shown when content is empty and not editing */
  placeholder?: string;
  hideLabel?: boolean;
  className?: string;
  /** Currently active editor name (controlled from parent) */
  activeEditor?: string | null;
  /** Notify parent that this editor wants to activate */
  onActivate?: (name: string | null) => void;
}

/**
 * Notion/Confluence-style inline rich text block.
 * - View mode (default): renders HTML or placeholder.
 *   Hover → subtle bg change. Click → enters edit mode with auto-focus.
 * - Edit mode: shows tiptap RichTextEditor.
 *   Click outside → returns to view mode.
 * - Only one editor active at a time (via activeEditor/onActivate).
 */
export function InlineRichText({
  name,
  label,
  content,
  onChange,
  placeholder = "Nhập nội dung...",
  hideLabel = false,
  className,
  activeEditor,
  onActivate,
}: InlineRichTextProps) {
  const isEditing = activeEditor === name;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [draftContent, setDraftContent] = React.useState(content ?? "");

  const isEmpty = !content || content === "<p></p>" || content.trim() === "";

  // Sync draft with content when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      setDraftContent(content ?? "");
    }
  }, [isEditing, content]);

  const handleSave = () => {
    onChange(draftContent);
    onActivate?.(null);
  };

  const handleCancel = () => {
    setDraftContent(content ?? "");
    onActivate?.(null);
  };

  return (
    <div className={cn("group", className)} ref={containerRef}>
      {!hideLabel && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
          {label}
        </p>
      )}

      {isEditing ? (
        <div className="space-y-2">
          <RichTextEditor
            content={draftContent}
            onChange={setDraftContent}
            placeholder={placeholder}
            editable
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" onClick={handleCancel} variant="ghost">
              Hủy
            </Button>
            <Button size="sm" onClick={handleSave}>
              Lưu
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="cursor-text rounded-md px-4 py-3 min-h-[48px] bg-muted/40 transition-colors hover:bg-muted/50"
          onClick={() => onActivate?.(name)}
        >
          {isEmpty ? (
            <p className="text-sm text-muted-foreground italic">
              {placeholder}
            </p>
          ) : (
            <RichTextDisplay content={content!} />
          )}
        </div>
      )}
    </div>
  );
}
