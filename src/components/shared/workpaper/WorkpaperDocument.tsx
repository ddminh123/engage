"use client";

import * as React from "react";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { JSONContent } from "@tiptap/react";
import type {
  WpCommentThread,
  WpThreadType,
} from "@/features/engagement/types";
import { WorkpaperEditor } from "./WorkpaperEditor";
import type { WorkpaperEditorHandle } from "./WorkpaperEditor";
import { WorkpaperCommentsTab } from "./WorkpaperCommentsTab";

// ── Configurable tab definition ──

export interface WorkpaperTab {
  key: string;
  label: string;
  content: React.ReactNode;
  badge?: number;
}

export interface WorkpaperDocumentConfig {
  entityType: string;
  entityId: string;
  engagementId?: string;
  title: string;
  content: JSONContent | null;
  onSave: (content: JSONContent) => void | Promise<void>;
  onTitleChange?: (title: string) => void;
  onBack: () => void;
  isSaving?: boolean;
  headerExtra?: React.ReactNode;
  readOnly?: boolean;
  /** Configurable tabs for the right task pane (comments tab is always appended) */
  tabs?: WorkpaperTab[];
  /** Label for the comments tab (default: "Soát xét") */
  commentsTabLabel?: string;
  /** Default active tab key */
  defaultTab?: string;
  // Comment handlers
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
}

export function WorkpaperDocument(config: WorkpaperDocumentConfig) {
  const {
    title,
    content,
    onSave,
    onTitleChange,
    onBack,
    isSaving = false,
    headerExtra,
    readOnly = false,
    tabs = [],
    commentsTabLabel = "Soát xét",
    defaultTab,
    threads = [],
    onCreateThread,
    onReplyToThread,
    onResolveThread,
    onReopenThread,
    onDeleteThread,
    isCreatingThread = false,
    isReplying = false,
  } = config;

  const editorRef = React.useRef<WorkpaperEditorHandle>(null);

  const [localContent, setLocalContent] = React.useState<JSONContent | null>(
    content,
  );
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(
    null,
  );
  const [pendingQuote, setPendingQuote] = React.useState<string | null>(null);
  const [pendingThreadType, setPendingThreadType] =
    React.useState<WpThreadType>("comment");
  const [pendingSelection, setPendingSelection] = React.useState<{
    from: number;
    to: number;
  } | null>(null);
  const commentsTabKey = "__comments__";
  const [rightTab, setRightTab] = React.useState<string>(
    defaultTab ?? (tabs.length > 0 ? tabs[0].key : commentsTabKey),
  );
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState(title);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  // Sync content from props when it changes externally
  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Sync title from props
  React.useEffect(() => {
    setTitleDraft(title);
  }, [title]);

  const handleContentChange = React.useCallback((json: JSONContent) => {
    setLocalContent(json);
  }, []);

  const handleSave = () => {
    if (localContent) {
      onSave(localContent);
    }
  };

  // Click on commented text in editor → activate thread in sidebar
  const handleCommentActivated = React.useCallback(
    (threadId: string | null) => {
      setActiveThreadId(threadId);
      if (threadId) {
        setRightTab(commentsTabKey);
      }
    },
    [commentsTabKey],
  );

  // Click on comment mark in editor → show + highlight in sidebar
  const handleCommentClicked = React.useCallback(
    (threadId: string) => {
      setActiveThreadId(threadId);
      setRightTab(commentsTabKey);
      // Highlight mark in editor
      editorRef.current?.highlightThread(threadId);
    },
    [commentsTabKey],
  );

  // Click on thread in sidebar → scroll to mark in editor
  const handleThreadClick = React.useCallback((threadId: string) => {
    setActiveThreadId(threadId);
    editorRef.current?.highlightThread(threadId);
  }, []);

  // Bubble menu → add comment or review note
  const handleAddComment = React.useCallback(
    (quote: string, threadType: WpThreadType, from: number, to: number) => {
      setPendingQuote(quote);
      setPendingThreadType(threadType);
      setPendingSelection({ from, to });
      setRightTab(commentsTabKey);
    },
    [commentsTabKey],
  );

  const handleCreateThread = async (comment: string) => {
    if (pendingQuote && onCreateThread) {
      const sel = pendingSelection;
      const tType = pendingThreadType;
      const threadId = await onCreateThread({
        quote: pendingQuote,
        comment,
        threadType: tType,
      });
      setPendingQuote(null);
      setPendingSelection(null);
      // Apply the comment mark to the editor text
      if (threadId && sel) {
        editorRef.current?.applyCommentMark(threadId, tType, sel.from, sel.to);
      }
    }
  };

  const handleCancelCreate = () => {
    setPendingQuote(null);
  };

  const handleTitleSave = () => {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft !== title && onTitleChange) {
      onTitleChange(titleDraft.trim());
    }
  };

  // Build count badges
  const openComments = threads.filter(
    (t) => t.status === "open" && t.threadType === "comment",
  ).length;
  const openReviewNotes = threads.filter(
    (t) => t.status === "open" && t.threadType === "review_note",
  ).length;
  const totalOpenThreads = openComments + openReviewNotes;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground shrink-0"
            title="Quay lại"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {editingTitle && onTitleChange ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") {
                  setTitleDraft(title);
                  setEditingTitle(false);
                }
              }}
              className="flex-1 min-w-0 text-lg font-semibold bg-transparent border-b-2 border-blue-400 outline-none px-1"
              title="Tiêu đề tài liệu"
              autoFocus
            />
          ) : (
            <h1
              className={cn(
                "flex-1 min-w-0 text-lg font-semibold truncate",
                onTitleChange &&
                  "cursor-pointer hover:text-blue-600 transition-colors",
              )}
              onClick={() => {
                if (onTitleChange) setEditingTitle(true);
              }}
              title={title}
            >
              {title}
            </h1>
          )}

          {headerExtra}

          <Separator orientation="vertical" className="h-5" />

          {!readOnly && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
              Lưu
            </Button>
          )}
        </div>
      </div>

      {/* ── Body: Editor (left) + Task Pane (right) ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Document Editor */}
        <div className="flex-1 overflow-y-auto border-r">
          <WorkpaperEditor
            ref={editorRef}
            content={localContent}
            onChange={handleContentChange}
            onCommentActivated={handleCommentActivated}
            onCommentClicked={handleCommentClicked}
            onAddComment={handleAddComment}
            readOnly={readOnly}
          />
        </div>

        {/* Right: Configurable Task Pane */}
        <div className="w-[340px] shrink-0 flex flex-col overflow-hidden bg-muted/20">
          <Tabs
            value={rightTab}
            onValueChange={setRightTab}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <TabsList className="mx-3 mt-2 h-8 w-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="text-xs px-3"
                >
                  {tab.label}
                  {tab.badge != null && tab.badge > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-medium text-white">
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
              <TabsTrigger value={commentsTabKey} className="text-xs px-3">
                {commentsTabLabel}
                {totalOpenThreads > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-medium text-white">
                    {totalOpenThreads}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent
                key={tab.key}
                value={tab.key}
                className="flex-1 overflow-y-auto mt-0"
              >
                <div className="p-3">{tab.content}</div>
              </TabsContent>
            ))}

            <TabsContent
              value={commentsTabKey}
              className="flex-1 overflow-y-auto mt-0"
            >
              <WorkpaperCommentsTab
                threads={threads}
                activeThreadId={activeThreadId}
                onThreadClick={handleThreadClick}
                onReply={(threadId, c) => onReplyToThread?.(threadId, c)}
                onResolve={(threadId) => onResolveThread?.(threadId)}
                onReopen={(threadId) => onReopenThread?.(threadId)}
                onDelete={(threadId) => onDeleteThread?.(threadId)}
                isReplying={isReplying || isCreatingThread}
                pendingQuote={pendingQuote}
                pendingThreadType={pendingThreadType}
                onCreateThread={handleCreateThread}
                onCancelCreate={handleCancelCreate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
