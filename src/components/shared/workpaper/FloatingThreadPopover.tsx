"use client";

import * as React from "react";
import {
  AnchoredPopoverContent,
  createVirtualAnchor,
} from "@/components/shared/AnchoredPopoverContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle2,
  RotateCcw,
  Send,
  NotepadText,
  Trash2,
  MessageSquarePlus,
  PanelRightOpen,
  Target,
} from "lucide-react";
import type { WpCommentThread } from "@/features/engagement/types";

// ── Helpers ──

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

// ═══════════════════════════════════════════════════════════════════════════════
// 1. FloatingThreadPopover — Confluence-style floating comment card
// ═══════════════════════════════════════════════════════════════════════════════

interface FloatingThreadPopoverProps {
  thread: WpCommentThread;
  anchorRect: DOMRect;
  onReply: (content: string) => void;
  onResolve: () => void;
  onReopen: () => void;
  onDelete: () => void;
  onClose: () => void;
  onNavigate?: (direction: "prev" | "next") => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  isReplying?: boolean;
  onToggleSidebar?: () => void;
}

export function FloatingThreadPopover({
  thread,
  anchorRect,
  onReply,
  onResolve,
  onReopen,
  onDelete,
  onClose,
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false,
  isReplying = false,
  onToggleSidebar,
}: FloatingThreadPopoverProps) {
  const [replyText, setReplyText] = React.useState("");

  const isReviewNote = thread.threadType === "review_note";
  const isResolved = thread.status === "resolved";

  const virtualAnchor = React.useMemo(
    () => createVirtualAnchor(anchorRect),
    [anchorRect],
  );

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText.trim());
    setReplyText("");
  };

  return (
    <AnchoredPopoverContent
      anchor={virtualAnchor}
      side="right"
      align="start"
      sideOffset={8}
      onClose={onClose}
      className="w-[320px] p-0"
    >
      {/* Header: nav arrows + badge + sidebar + close */}
      <div className="flex items-center gap-1 border-b px-2 py-1.5">
        {onNavigate && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onNavigate("prev")}
              disabled={!canNavigatePrev}
              title="Trước"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onNavigate("next")}
              disabled={!canNavigateNext}
              title="Sau"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </>
        )}

        {isReviewNote && (
          <Badge
            variant="secondary"
            className="text-[10px] font-normal text-orange-700 bg-orange-100 ml-1"
          >
            <NotepadText className="mr-0.5 h-2.5 w-2.5" />
            Review Note
          </Badge>
        )}

        {isResolved && (
          <Badge variant="secondary" className="text-[10px] font-normal ml-1">
            <CheckCircle2 className="mr-0.5 h-2.5 w-2.5 text-green-600" />
            Đã xử lý
          </Badge>
        )}

        <div className="flex-1" />

        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggleSidebar}
            title="Hiện bảng soát xét"
          >
            <PanelRightOpen className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
          title="Đóng"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Thread body */}
      <div className="max-h-[300px] overflow-y-auto p-3 space-y-2">
        {/* Quote */}
        {thread.quote && (
          <div
            className={cn(
              "rounded bg-muted/60 px-2 py-1 text-xs text-muted-foreground italic border-l-2",
              isReviewNote ? "border-orange-300" : "border-blue-300",
            )}
          >
            &ldquo;
            {thread.quote.length > 100
              ? thread.quote.slice(0, 100) + "…"
              : thread.quote}
            &rdquo;
          </div>
        )}

        {/* Comments */}
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

      {/* Actions + Reply */}
      <div className="border-t px-3 py-2 space-y-2">
        <div className="flex items-center gap-1">
          {!isResolved && (
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
          {isResolved && (
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
        {!isResolved && (
          <div className="flex gap-1.5">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Trả lời..."
              className="min-h-[32px] h-8 text-xs resize-none flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleReply();
                }
              }}
            />
            <Button
              size="sm"
              className="h-8 px-2"
              onClick={handleReply}
              disabled={!replyText.trim() || isReplying}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </AnchoredPopoverContent>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. FloatingNewComment — Input popover for creating a new thread
// ═══════════════════════════════════════════════════════════════════════════════

interface FloatingNewCommentProps {
  quote: string;
  threadType: "comment" | "review_note";
  anchorRect: DOMRect;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
}

export function FloatingNewComment({
  quote,
  threadType,
  anchorRect,
  onSubmit,
  onCancel,
}: FloatingNewCommentProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [text, setText] = React.useState("");

  const isReviewNote = threadType === "review_note";

  const virtualAnchor = React.useMemo(
    () => createVirtualAnchor(anchorRect),
    [anchorRect],
  );

  React.useEffect(() => {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <AnchoredPopoverContent
      anchor={virtualAnchor}
      side="right"
      align="start"
      sideOffset={8}
      onClose={onCancel}
      className={cn(
        "w-[300px] p-3 space-y-2",
        isReviewNote
          ? "border-orange-200 bg-orange-50"
          : "border-blue-200 bg-blue-50",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium",
            isReviewNote ? "text-orange-600" : "text-blue-600",
          )}
        >
          {isReviewNote ? "Review Note" : "Ý kiến"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        &ldquo;{quote.length > 60 ? quote.slice(0, 60) + "…" : quote}&rdquo;
      </div>
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isReviewNote ? "Nhập review note..." : "Nhập ý kiến..."}
        className="min-h-[60px] text-sm resize-none bg-background"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSubmit} disabled={!text.trim()}>
          <Send className="mr-1 h-3 w-3" />
          Gửi
        </Button>
      </div>
    </AnchoredPopoverContent>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SelectionCommentToolbar — Appears above selected text to add comment
// ═══════════════════════════════════════════════════════════════════════════════

interface SelectionCommentToolbarProps {
  anchorRect: DOMRect;
  onAddComment: (threadType: "comment" | "review_note") => void;
  onAddObjective?: () => void;
}

export function SelectionCommentToolbar({
  anchorRect,
  onAddComment,
  onAddObjective,
}: SelectionCommentToolbarProps) {
  const virtualAnchor = React.useMemo(
    () => createVirtualAnchor(anchorRect),
    [anchorRect],
  );

  return (
    <AnchoredPopoverContent
      anchor={virtualAnchor}
      side="top"
      align="center"
      sideOffset={6}
      className="flex items-center gap-0.5 px-1 py-0.5"
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => onAddComment("comment")}
      >
        <MessageSquarePlus className="mr-1 h-3.5 w-3.5" />Ý kiến
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700"
        onClick={() => onAddComment("review_note")}
      >
        <NotepadText className="mr-1 h-3.5 w-3.5" />
        Review
      </Button>
      {onAddObjective && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-teal-600 hover:text-teal-700"
          onClick={onAddObjective}
        >
          <Target className="mr-1 h-3.5 w-3.5" />
          Mục tiêu
        </Button>
      )}
    </AnchoredPopoverContent>
  );
}
