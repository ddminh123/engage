"use client";

import { useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import type { Editor } from "@tiptap/react";
import type { JSONContent, AnyExtension } from "@tiptap/react";
import {
  EngageEditor,
  type EngageEditorHandle,
} from "@/components/shared/RichTextEditor/EngageEditor";
import { CommentMark } from "./extensions/CommentMark";
import { FindingMark } from "./extensions/FindingMark";
import type { WpThreadType } from "@/features/engagement/types";

// ── Public handle (superset of EngageEditorHandle) ──

export interface WorkpaperEditorHandle {
  getEditor: () => Editor | null;
  highlightThread: (threadId: string | null) => void;
  applyCommentMark: (
    threadId: string,
    threadType: string,
    from: number,
    to: number,
  ) => void;
  clearPendingCommentRange: () => void;
  // Finding methods
  highlightFinding: (findingId: string | null) => void;
  applyFindingMark: (findingId: string, from: number, to: number) => void;
  clearPendingFindingRange: () => void;
  unsetFindingMark: (findingId: string) => void;
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
  /** Override the editor content area class (default: fullscreen overlay height) */
  editorClassName?: string;
  // Finding callbacks (optional — only wired when finding feature is enabled)
  onFindingActivated?: (findingId: string | null) => void;
  onFindingClicked?: (findingId: string) => void;
  onAddFinding?: (quote: string, from: number, to: number) => void;
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
    editorClassName,
    onFindingActivated,
    onFindingClicked,
    onAddFinding,
  },
  ref,
) {
  const baseRef = useRef<EngageEditorHandle>(null);

  // Memoize extra extensions so the array reference is stable
  const extraExtensions = useMemo(() => {
    const exts: AnyExtension[] = [
      CommentMark.configure({
        HTMLAttributes: {},
        onCommentActivated,
        onCommentClicked,
      }),
    ];
    if (onFindingActivated && onFindingClicked) {
      exts.push(
        FindingMark.configure({
          HTMLAttributes: {},
          onFindingActivated,
          onFindingClicked,
        }),
      );
    }
    return exts;
  }, [onCommentActivated, onCommentClicked, onFindingActivated, onFindingClicked]);

  // Expose comment + finding imperative methods
  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => baseRef.current?.getEditor() ?? null,
      highlightThread: (threadId: string | null) => {
        const editor = baseRef.current?.getEditor();
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
        const editor = baseRef.current?.getEditor();
        if (editor) {
          editor
            .chain()
            .clearPendingCommentRange()
            .setTextSelection({ from, to })
            .setComment(threadId, threadType)
            .run();
        }
      },
      clearPendingCommentRange: () => {
        const editor = baseRef.current?.getEditor();
        if (editor) {
          editor.commands.clearPendingCommentRange();
        }
      },
      // Finding methods
      highlightFinding: (findingId: string | null) => {
        const editor = baseRef.current?.getEditor();
        if (editor) {
          editor.commands.highlightFinding(findingId);
        }
      },
      applyFindingMark: (findingId: string, from: number, to: number) => {
        const editor = baseRef.current?.getEditor();
        if (editor) {
          editor
            .chain()
            .clearPendingFindingRange()
            .setTextSelection({ from, to })
            .setFindingMark(findingId)
            .run();
        }
      },
      clearPendingFindingRange: () => {
        const editor = baseRef.current?.getEditor();
        if (editor) {
          editor.commands.clearPendingFindingRange();
        }
      },
      unsetFindingMark: (findingId: string) => {
        const editor = baseRef.current?.getEditor();
        if (editor) {
          editor.commands.unsetFindingMark(findingId);
        }
      },
    }),
    [],
  );

  const handleAddComment = (threadType: "comment" | "review_note") => {
    const editor = baseRef.current?.getEditor();
    if (!editor) return;
    let { from, to } = editor.state.selection;

    // If collapsed selection inside a table cell, expand to the cell content range
    if (from === to && editor.isActive("table")) {
      const $pos = editor.state.doc.resolve(from);
      for (let d = $pos.depth; d > 0; d--) {
        const node = $pos.node(d);
        if (
          node.type.name === "tableCell" ||
          node.type.name === "tableHeader"
        ) {
          from = $pos.start(d);
          to = $pos.end(d);
          break;
        }
      }
    }

    if (from === to) return;
    const quote = editor.state.doc.textBetween(from, to, " ");
    // Apply temporary highlight decoration so text stays visible while composing
    editor.commands.setPendingCommentRange(from, to);
    onAddComment(quote || "[empty cell]", threadType, from, to);
  };

  const handleAddFinding = () => {
    const editor = baseRef.current?.getEditor();
    if (!editor || !onAddFinding) return;
    let { from, to } = editor.state.selection;

    // If collapsed selection inside a table cell, expand to the cell content range
    if (from === to && editor.isActive("table")) {
      const $pos = editor.state.doc.resolve(from);
      for (let d = $pos.depth; d > 0; d--) {
        const node = $pos.node(d);
        if (
          node.type.name === "tableCell" ||
          node.type.name === "tableHeader"
        ) {
          from = $pos.start(d);
          to = $pos.end(d);
          break;
        }
      }
    }

    if (from === to) return;
    const quote = editor.state.doc.textBetween(from, to, " ");
    editor.commands.setPendingFindingRange(from, to);
    onAddFinding(quote || "[empty cell]", from, to);
  };

  return (
    <EngageEditor
      ref={baseRef}
      content={content}
      onChange={onChange}
      readOnly={readOnly}
      className={className}
      editorClassName={editorClassName ?? "min-h-[calc(100vh-200px)]"}
      extraExtensions={extraExtensions}
      onAddComment={handleAddComment}
      onAddFinding={onAddFinding ? handleAddFinding : undefined}
    />
  );
});

// Re-export editor ref for parent access
export type { Editor };
