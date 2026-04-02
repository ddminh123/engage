"use client";

import * as React from "react";
import type { JSONContent } from "@tiptap/react";
import type {
  WpCommentThread,
  WpThreadType,
} from "@/features/engagement/types";
import { WorkpaperEditor } from "./WorkpaperEditor";
import type { WorkpaperEditorHandle } from "./WorkpaperEditor";
import { WorkpaperCommentsTab } from "./WorkpaperCommentsTab";
import {
  FloatingThreadPopover,
  FloatingNewComment,
  SelectionCommentToolbar,
} from "./FloatingThreadPopover";
import { Button } from "@/components/ui/button";
import { PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Props ──

export interface WorkpaperViewerProps {
  content: JSONContent | null;
  threads?: WpCommentThread[];
  onCreateThread?: (data: {
    quote: string;
    comment: string;
    threadType: WpThreadType;
  }) => Promise<string | undefined>;
  onReplyToThread?: (threadId: string, content: string) => void;
  onResolveThread?: (threadId: string) => void;
  onReopenThread?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
  isCreatingThread?: boolean;
  isReplying?: boolean;
  /** Called after a comment mark is applied so the updated content can be persisted */
  onContentChange?: (content: JSONContent) => Promise<void>;
  className?: string;
  /** Editor content area class override (default: min-h-[400px]) */
  editorClassName?: string;
  /** Optional signoff bar rendered above the editor content */
  signoffBar?: React.ReactNode;
  /** Default right sidebar content shown when comments sidebar is closed */
  defaultSidebar?: React.ReactNode;
}

// ── Component ──

export function WorkpaperViewer({
  content,
  threads = [],
  onCreateThread,
  onReplyToThread,
  onResolveThread,
  onReopenThread,
  onDeleteThread,
  isCreatingThread = false,
  isReplying = false,
  onContentChange,
  className,
  editorClassName = "min-h-[400px]",
  signoffBar,
  defaultSidebar,
}: WorkpaperViewerProps) {
  const editorRef = React.useRef<WorkpaperEditorHandle>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleCommentClickedRef =
    React.useRef<(threadId: string) => void>(undefined);

  // ── Floating popover state ──
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(
    null,
  );
  const [activeAnchorRect, setActiveAnchorRect] =
    React.useState<DOMRect | null>(null);

  // ── Selection toolbar state ──
  const [selectionRect, setSelectionRect] = React.useState<DOMRect | null>(
    null,
  );
  const [selectionRange, setSelectionRange] = React.useState<{
    from: number;
    to: number;
  } | null>(null);

  // ── New comment creation state ──
  const [newCommentState, setNewCommentState] = React.useState<{
    quote: string;
    threadType: WpThreadType;
    from: number;
    to: number;
    anchorRect: DOMRect;
  } | null>(null);

  // ── Comments sidebar toggle ──
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const showDefaultSidebar = !!defaultSidebar && !sidebarOpen;

  // ── Track editor readiness for mouseup listener ──
  const [editorReady, setEditorReady] = React.useState(false);

  // ── Derived ──
  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;
  const openThreads = React.useMemo(
    () => threads.filter((t) => t.status === "open"),
    [threads],
  );
  const activeIdx = activeThread
    ? openThreads.findIndex((t) => t.id === activeThread.id)
    : -1;

  // ── Detect editor ready ──
  React.useEffect(() => {
    if (editorReady) return;
    const timer = setInterval(() => {
      if (editorRef.current?.getEditor()) {
        setEditorReady(true);
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [editorReady]);

  // ── Editor callbacks ──

  const handleCommentClickedFn = React.useCallback((threadId: string) => {
    setSelectionRect(null);
    setNewCommentState(null);

    const scope = containerRef.current ?? document;
    const el = scope.querySelector(`span[data-thread-id="${threadId}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setActiveThreadId(threadId);
      setActiveAnchorRect(rect);
      editorRef.current?.highlightThread(threadId);
    }
  }, []);

  // Keep a ref to handleCommentClicked so the DOM listener always has latest
  React.useEffect(() => {
    handleCommentClickedRef.current = handleCommentClickedFn;
  });

  // DOM click fallback — ensures comment marks are clickable in read-only mode
  // even if ProseMirror's handleClick doesn't fire
  React.useEffect(() => {
    if (!editorReady) return;
    const container = containerRef.current;
    if (!container) return;

    const handleDomClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest?.(
        "span[data-thread-id]",
      );
      if (target) {
        const threadId = target.getAttribute("data-thread-id");
        if (threadId) {
          handleCommentClickedRef.current?.(threadId);
        }
      }
    };

    container.addEventListener("click", handleDomClick);
    return () => container.removeEventListener("click", handleDomClick);
  }, [editorReady]);

  // Alias for passing to child components
  const handleCommentClicked = handleCommentClickedFn;

  const handleCommentActivated = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_: string | null) => {
      // No-op in viewer — popover handles activation via handleCommentClicked
    },
    [],
  );

  // ── Monitor text selection for floating toolbar ──

  React.useEffect(() => {
    if (!editorReady) return;
    const editor = editorRef.current?.getEditor();
    const editorEl = editor?.view?.dom;
    if (!editorEl) return;

    const handleMouseUp = () => {
      requestAnimationFrame(() => {
        const ed = editorRef.current?.getEditor();
        if (!ed) return;

        const { from, to } = ed.state.selection;
        if (from === to) {
          setSelectionRect(null);
          setSelectionRange(null);
          return;
        }

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0) {
            setSelectionRect(rect);
            setSelectionRange({ from, to });
            setActiveThreadId(null);
            setActiveAnchorRect(null);
          }
        }
      });
    };

    editorEl.addEventListener("mouseup", handleMouseUp);
    return () => editorEl.removeEventListener("mouseup", handleMouseUp);
  }, [editorReady]);

  // ── Dismiss selection toolbar on click outside ──

  React.useEffect(() => {
    if (!selectionRect) return;

    const handleMouseDown = () => {
      // Defer so the click itself can still be processed (e.g. clicking a comment mark)
      requestAnimationFrame(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          setSelectionRect(null);
          setSelectionRange(null);
        }
      });
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [selectionRect]);

  // ── Selection → add comment ──

  const handleAddCommentFromSelection = React.useCallback(
    (threadType: WpThreadType) => {
      const editor = editorRef.current?.getEditor();
      if (!editor || !selectionRange) return;

      const { from, to } = selectionRange;
      const quote = editor.state.doc.textBetween(from, to, " ");

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();

        // Temporarily enable editing to apply pending highlight decoration
        editor.setEditable(true);
        editor.commands.setPendingCommentRange(from, to);
        editor.setEditable(false);

        setNewCommentState({
          quote: quote || "[empty]",
          threadType,
          from,
          to,
          anchorRect: rect,
        });
        setSelectionRect(null);
      }
    },
    [selectionRange],
  );

  // ── Create thread from floating new-comment input ──

  const handleCreateThread = React.useCallback(
    async (comment: string) => {
      if (!newCommentState || !onCreateThread) return;

      const threadId = await onCreateThread({
        quote: newCommentState.quote,
        comment,
        threadType: newCommentState.threadType,
      });

      if (threadId) {
        const editor = editorRef.current?.getEditor();
        if (editor) {
          editor.setEditable(true);
          editor
            .chain()
            .clearPendingCommentRange()
            .setTextSelection({
              from: newCommentState.from,
              to: newCommentState.to,
            })
            .setComment(threadId, newCommentState.threadType)
            .run();
          editor.setEditable(false);

          if (onContentChange) {
            await onContentChange(editor.getJSON());
          }
        }
      }

      setNewCommentState(null);
    },
    [newCommentState, onCreateThread, onContentChange],
  );

  const handleCancelCreate = React.useCallback(() => {
    const editor = editorRef.current?.getEditor();
    if (editor) {
      editor.setEditable(true);
      editor.commands.clearPendingCommentRange();
      editor.setEditable(false);
    }
    setNewCommentState(null);
  }, []);

  // ── Popover controls ──

  const handleClosePopover = React.useCallback(() => {
    setActiveThreadId(null);
    setActiveAnchorRect(null);
    editorRef.current?.highlightThread(null);
  }, []);

  const handleNavigate = React.useCallback(
    (direction: "prev" | "next") => {
      if (activeIdx < 0) return;
      const newIdx = direction === "prev" ? activeIdx - 1 : activeIdx + 1;
      if (newIdx < 0 || newIdx >= openThreads.length) return;
      const newThread = openThreads[newIdx];
      handleCommentClicked(newThread.id);
    },
    [activeIdx, openThreads, handleCommentClicked],
  );

  // ── Sidebar thread click → highlight in editor ──

  const handleSidebarThreadClick = React.useCallback(
    (threadId: string) => {
      handleCommentClicked(threadId);
    },
    [handleCommentClicked],
  );

  // ── Render ──

  return (
    <div ref={containerRef} className={cn("flex flex-col", className)}>
      {/* Signoff bar */}
      {signoffBar}

      {/* Editor + sidebar row */}
      <div className="flex gap-0 flex-1">
        {/* Content area */}
        <div className="flex-1 min-w-0">
          <WorkpaperEditor
            ref={editorRef}
            content={content}
            onChange={() => {}}
            onCommentActivated={handleCommentActivated}
            onCommentClicked={handleCommentClicked}
            onAddComment={() => {}}
            readOnly
            editorClassName={editorClassName}
          />
        </div>

        {/* Default sidebar (e.g. objectives list) — shown when comments sidebar is closed */}
        {showDefaultSidebar && (
          <div className="w-[320px] shrink-0 border-l overflow-y-auto bg-muted/10">
            <div className="p-3">{defaultSidebar}</div>
          </div>
        )}

        {/* Togglable comments sidebar */}
        {sidebarOpen && (
          <div className="w-[320px] shrink-0 border-l overflow-y-auto bg-muted/10">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                Soát xét
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSidebarOpen(false)}
                title="Ẩn bảng soát xét"
              >
                <PanelRightClose className="h-3.5 w-3.5" />
              </Button>
            </div>
            <WorkpaperCommentsTab
              threads={threads}
              activeThreadId={activeThreadId}
              onThreadClick={handleSidebarThreadClick}
              onReply={(threadId, content) =>
                onReplyToThread?.(threadId, content)
              }
              onResolve={(threadId) => onResolveThread?.(threadId)}
              onReopen={(threadId) => onReopenThread?.(threadId)}
              onDelete={(threadId) => onDeleteThread?.(threadId)}
              isReplying={isReplying}
            />
          </div>
        )}

        {/* Floating selection toolbar */}
        {selectionRect && !newCommentState && (
          <SelectionCommentToolbar
            anchorRect={selectionRect}
            onAddComment={handleAddCommentFromSelection}
          />
        )}

        {/* Floating new comment input */}
        {newCommentState && (
          <FloatingNewComment
            quote={newCommentState.quote}
            threadType={newCommentState.threadType}
            anchorRect={newCommentState.anchorRect}
            onSubmit={handleCreateThread}
            onCancel={handleCancelCreate}
          />
        )}

        {/* Floating thread popover */}
        {activeThread && activeAnchorRect && (
          <FloatingThreadPopover
            thread={activeThread}
            anchorRect={activeAnchorRect}
            onReply={(c) => onReplyToThread?.(activeThread.id, c)}
            onResolve={() => onResolveThread?.(activeThread.id)}
            onReopen={() => onReopenThread?.(activeThread.id)}
            onDelete={() => {
              onDeleteThread?.(activeThread.id);
              handleClosePopover();
            }}
            onClose={handleClosePopover}
            onNavigate={handleNavigate}
            canNavigatePrev={activeIdx > 0}
            canNavigateNext={activeIdx < openThreads.length - 1}
            isReplying={isReplying || isCreatingThread}
            onToggleSidebar={() => {
              setSidebarOpen((prev) => !prev);
              handleClosePopover();
            }}
          />
        )}
      </div>
    </div>
  );
}
