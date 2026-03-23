"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  RotateCcw,
  Send,
  MessageSquare,
  NotepadText,
  Trash2,
} from "lucide-react";
import type {
  WpCommentThread,
  WpThreadType,
} from "@/features/engagement/types";

interface WorkpaperCommentsTabProps {
  threads: WpCommentThread[];
  activeThreadId: string | null;
  onThreadClick: (threadId: string) => void;
  onReply: (threadId: string, content: string) => void;
  onResolve: (threadId: string) => void;
  onReopen: (threadId: string) => void;
  onDelete: (threadId: string) => void;
  isReplying?: boolean;
  pendingQuote?: string | null;
  pendingThreadType?: WpThreadType;
  onCreateThread?: (comment: string) => void;
  onCancelCreate?: () => void;
}

export function WorkpaperCommentsTab({
  threads,
  activeThreadId,
  onThreadClick,
  onReply,
  onResolve,
  onReopen,
  onDelete,
  isReplying = false,
  pendingQuote,
  pendingThreadType = "comment",
  onCreateThread,
  onCancelCreate,
}: WorkpaperCommentsTabProps) {
  const threadRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll active thread into view when activeThreadId changes
  React.useEffect(() => {
    if (activeThreadId && threadRefs.current[activeThreadId]) {
      threadRefs.current[activeThreadId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeThreadId]);

  // Separate by type, then by status
  const openReviewNotes = threads.filter(
    (t) => t.status === "open" && t.threadType === "review_note",
  );
  const openComments = threads.filter(
    (t) => t.status === "open" && t.threadType === "comment",
  );
  const resolvedThreads = threads.filter((t) => t.status === "resolved");

  const isEmpty =
    openReviewNotes.length === 0 &&
    openComments.length === 0 &&
    resolvedThreads.length === 0 &&
    !pendingQuote;

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* New thread creation */}
      {pendingQuote && onCreateThread && (
        <NewCommentBox
          quote={pendingQuote}
          threadType={pendingThreadType}
          onSubmit={onCreateThread}
          onCancel={onCancelCreate}
        />
      )}

      {isEmpty && (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 opacity-40" />
          <p className="text-sm">Chưa có bình luận nào</p>
          <p className="text-xs">Chọn văn bản và nhấn nút bình luận để thêm</p>
        </div>
      )}

      {/* Review notes (shown first — higher priority) */}
      {openReviewNotes.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-orange-600">
            <NotepadText className="h-3.5 w-3.5" />
            Review Notes ({openReviewNotes.length})
          </p>
          <div className="space-y-2">
            {openReviewNotes.map((thread) => (
              <CommentThread
                key={thread.id}
                ref={(el) => {
                  threadRefs.current[thread.id] = el;
                }}
                thread={thread}
                isActive={thread.id === activeThreadId}
                onClick={() => onThreadClick(thread.id)}
                onReply={(content) => onReply(thread.id, content)}
                onResolve={() => onResolve(thread.id)}
                onDelete={() => onDelete(thread.id)}
                isReplying={isReplying}
              />
            ))}
          </div>
        </div>
      )}

      {/* Open comments */}
      {openComments.length > 0 && (
        <div>
          {openReviewNotes.length > 0 && (
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Bình luận ({openComments.length})
            </p>
          )}
          <div className="space-y-2">
            {openComments.map((thread) => (
              <CommentThread
                key={thread.id}
                ref={(el) => {
                  threadRefs.current[thread.id] = el;
                }}
                thread={thread}
                isActive={thread.id === activeThreadId}
                onClick={() => onThreadClick(thread.id)}
                onReply={(content) => onReply(thread.id, content)}
                onResolve={() => onResolve(thread.id)}
                onDelete={() => onDelete(thread.id)}
                isReplying={isReplying}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resolved threads */}
      {resolvedThreads.length > 0 && (
        <div className="mt-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Đã xử lý ({resolvedThreads.length})
          </p>
          <div className="space-y-2">
            {resolvedThreads.map((thread) => (
              <CommentThread
                key={thread.id}
                ref={(el) => {
                  threadRefs.current[thread.id] = el;
                }}
                thread={thread}
                isActive={thread.id === activeThreadId}
                onClick={() => onThreadClick(thread.id)}
                onReply={(content) => onReply(thread.id, content)}
                onReopen={() => onReopen(thread.id)}
                onDelete={() => onDelete(thread.id)}
                isReplying={isReplying}
                resolved
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NewCommentBox({
  quote,
  threadType,
  onSubmit,
  onCancel,
}: {
  quote: string;
  threadType: WpThreadType;
  onSubmit: (comment: string) => void;
  onCancel?: () => void;
}) {
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isReviewNote = threadType === "review_note";

  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2",
        isReviewNote
          ? "border-orange-200 bg-orange-50/50"
          : "border-blue-200 bg-blue-50/50",
      )}
    >
      <div className="text-xs text-muted-foreground">
        {isReviewNote ? (
          <span className="font-medium text-orange-600">Review Note</span>
        ) : (
          "Bình luận về"
        )}
        :{" "}
        <span className="font-medium text-foreground">
          &ldquo;{quote.length > 60 ? quote.slice(0, 60) + "…" : quote}&rdquo;
        </span>
      </div>
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isReviewNote ? "Nhập review note..." : "Nhập bình luận..."}
        className="min-h-[60px] text-sm resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button size="sm" onClick={handleSubmit} disabled={!text.trim()}>
          <Send className="mr-1.5 h-3 w-3" />
          Gửi
        </Button>
      </div>
    </div>
  );
}

const CommentThread = React.forwardRef<
  HTMLDivElement,
  {
    thread: WpCommentThread;
    isActive: boolean;
    onClick: () => void;
    onReply: (content: string) => void;
    onResolve?: () => void;
    onReopen?: () => void;
    onDelete: () => void;
    isReplying: boolean;
    resolved?: boolean;
  }
>(function CommentThreadInner(
  {
    thread,
    isActive,
    onClick,
    onReply,
    onResolve,
    onReopen,
    onDelete,
    isReplying,
    resolved = false,
  },
  ref,
) {
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const isReviewNote = thread.threadType === "review_note";

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText.trim());
    setReplyText("");
    setReplyOpen(false);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border p-3 transition-all cursor-pointer",
        isActive && !isReviewNote && "ring-2 ring-blue-400 border-blue-300",
        isActive && isReviewNote && "ring-2 ring-orange-400 border-orange-300",
        resolved && "opacity-70",
        !isActive && "hover:border-muted-foreground/30",
        isReviewNote &&
          !isActive &&
          !resolved &&
          "border-orange-200 bg-orange-50/30",
      )}
      onClick={onClick}
    >
      {/* Thread type indicator + quote */}
      {isReviewNote && !resolved && (
        <Badge
          variant="secondary"
          className="mb-2 text-xs font-normal text-orange-700 bg-orange-100"
        >
          <NotepadText className="mr-1 h-3 w-3" />
          Review Note
        </Badge>
      )}

      {thread.quote && (
        <div
          className={cn(
            "mb-2 rounded bg-muted/60 px-2 py-1 text-xs text-muted-foreground italic border-l-2",
            isReviewNote ? "border-orange-300" : "border-blue-300",
          )}
        >
          &ldquo;
          {thread.quote.length > 80
            ? thread.quote.slice(0, 80) + "…"
            : thread.quote}
          &rdquo;
        </div>
      )}

      {/* Resolved badge */}
      {resolved && (
        <Badge variant="secondary" className="mb-2 text-xs font-normal">
          <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
          Đã xử lý
        </Badge>
      )}

      {/* Comments */}
      <div className="space-y-2">
        {thread.comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={comment.author.avatarUrl ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {comment.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium truncate">
                  {comment.author.name}
                </span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div
        className="mt-2 flex items-center gap-1 pt-1 border-t"
        onClick={(e) => e.stopPropagation()}
      >
        {!resolved && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => setReplyOpen(!replyOpen)}
          >
            Trả lời
          </Button>
        )}
        {onResolve && !resolved && (
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-6 px-2 text-xs",
              isReviewNote
                ? "text-orange-600 hover:text-orange-700"
                : "text-green-600 hover:text-green-700",
            )}
            onClick={onResolve}
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Xử lý
          </Button>
        )}
        {onReopen && resolved && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={onReopen}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Mở lại
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs text-destructive hover:text-destructive/80 ml-auto"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Reply input */}
      {replyOpen && (
        <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Nhập trả lời..."
            className="min-h-[40px] text-sm resize-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleReply();
              }
            }}
          />
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => {
                setReplyOpen(false);
                setReplyText("");
              }}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              className="h-6 text-xs"
              onClick={handleReply}
              disabled={!replyText.trim() || isReplying}
            >
              Gửi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} giờ trước`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}
