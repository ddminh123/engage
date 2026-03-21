"use client";

import * as React from "react";
import { RichTextEditor, RichTextDisplay } from "./RichTextEditor";
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
  className,
  activeEditor,
  onActivate,
}: InlineRichTextProps) {
  const isEditing = activeEditor === name;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isEmpty = !content || content === "<p></p>" || content.trim() === "";

  // Click-outside listener to deactivate
  React.useEffect(() => {
    if (!isEditing) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onActivate?.(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, onActivate]);

  return (
    <div className={cn("group", className)} ref={containerRef}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
        {label}
      </p>

      {isEditing ? (
        <RichTextEditor
          content={content ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          editable
          autoFocus
        />
      ) : (
        <div
          className="cursor-text rounded-md px-4 py-3 min-h-[48px] transition-colors hover:bg-muted/50"
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
