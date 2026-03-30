"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type {
  AvailableTransition,
  EngagementMember,
} from "@/features/engagement/types";

// ── Action type → next-person label mapping ──
// Only action types listed here will show the confirmation popover.
// All other action types (start, approve, etc.) execute immediately.

const NEXT_PERSON_LABEL: Record<string, string> = {
  submit: "Người soát xét",
  review: "Người phê duyệt",
  reject: "Gửi lại cho",
  revise: "Gửi lại cho",
};

/** Returns true if this transition needs a confirmation popover (has next-person picker) */
export function needsConfirmation(t: AvailableTransition): boolean {
  return t.actionType in NEXT_PERSON_LABEL;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Transition Confirm Content (rendered inside a Popover by WorkpaperActions) ──

interface TransitionConfirmContentProps {
  transition: AvailableTransition;
  members: EngagementMember[];
  onConfirm: (params: {
    transitionId: string;
    comment?: string;
    nextAssigneeId?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultNextAssigneeId?: string;
}

export function TransitionConfirmContent({
  transition,
  members,
  onConfirm,
  onCancel,
  isLoading = false,
  defaultNextAssigneeId,
}: TransitionConfirmContentProps) {
  const [comment, setComment] = React.useState("");
  const [nextAssigneeId, setNextAssigneeId] = React.useState<string | null>(
    defaultNextAssigneeId ?? null,
  );

  // Reset form when transition changes
  const transitionId = transition.id;
  React.useEffect(() => {
    setComment("");
    setNextAssigneeId(defaultNextAssigneeId ?? null);
  }, [transitionId, defaultNextAssigneeId]);

  const pickerLabel = NEXT_PERSON_LABEL[transition.actionType];
  const showPicker = !!pickerLabel;

  const handleConfirm = () => {
    onConfirm({
      transitionId: transition.id,
      comment: comment.trim() || undefined,
      nextAssigneeId: nextAssigneeId ?? undefined,
    });
  };

  return (
    <div className="p-3 space-y-3">
      <div>
        <div className="font-medium text-sm">{transition.actionLabel}</div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Xác nhận hành động trên tài liệu làm việc.
        </p>
      </div>

      {/* Comment field */}
      <div className="space-y-1.5">
        <Label htmlFor="transition-comment" className="text-xs">
          Ghi chú{" "}
          <span className="text-muted-foreground font-normal">
            (không bắt buộc)
          </span>
        </Label>
        <Textarea
          id="transition-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập ghi chú..."
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      {/* Next person picker */}
      {showPicker && (
        <div className="space-y-1.5">
          <Label className="text-xs">{pickerLabel}</Label>
          <div className="max-h-40 overflow-y-auto rounded-md border">
            {members.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 text-center">
                Không có thành viên nào.
              </p>
            ) : (
              members.map((m) => {
                const isSelected = nextAssigneeId === m.userId;
                return (
                  <button
                    key={m.userId}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-2.5 py-1.5 text-sm transition-colors hover:bg-accent",
                      isSelected && "bg-accent",
                    )}
                    onClick={() =>
                      setNextAssigneeId(isSelected ? null : m.userId)
                    }
                  >
                    <Avatar size="sm">
                      {m.user.avatarUrl && (
                        <AvatarImage src={m.user.avatarUrl} />
                      )}
                      <AvatarFallback>
                        {getInitials(m.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate text-xs">
                        {m.user.name}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button size="sm" onClick={handleConfirm} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {transition.actionLabel}
        </Button>
      </div>
    </div>
  );
}
