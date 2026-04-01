"use client";

import * as React from "react";
import { Loader2, ChevronDown, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  AvailableTransition,
  EngagementMember,
} from "@/features/engagement/types";
import {
  TransitionConfirmContent,
  needsConfirmation,
} from "./TransitionDialog";

interface WorkpaperActionsProps {
  transitions: AvailableTransition[];
  onTransition: (
    transitionId: string,
    comment?: string,
    nextAssigneeId?: string,
  ) => void;
  isTransitioning?: boolean;
  onViewWorkflow?: () => void;
  /** Engagement members for the next-person picker */
  members?: EngagementMember[];
  /** Use smaller, outline-style buttons (for inline/section views) */
  compact?: boolean;
}

export function WorkpaperActions({
  transitions,
  onTransition,
  isTransitioning = false,
  onViewWorkflow,
  members = [],
  compact = false,
}: WorkpaperActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [confirmTransition, setConfirmTransition] =
    React.useState<AvailableTransition | null>(null);

  if (transitions.length === 0 && !onViewWorkflow) return null;

  // Primary = first transition (highest priority per sort_order)
  const primary = transitions[0] ?? null;
  const secondary = transitions.slice(1);
  const hasDropdown = secondary.length > 0 || !!onViewWorkflow;

  const handleSelectTransition = (t: AvailableTransition) => {
    if (needsConfirmation(t)) {
      setConfirmTransition(t);
    } else {
      onTransition(t.id);
    }
  };

  const handleConfirm = (params: {
    transitionId: string;
    comment?: string;
    nextAssigneeId?: string;
  }) => {
    onTransition(params.transitionId, params.comment, params.nextAssigneeId);
    setConfirmTransition(null);
  };

  if (!primary && onViewWorkflow) {
    return (
      <Button variant="outline" size="sm" onClick={onViewWorkflow}>
        <Workflow className="mr-1.5 h-3.5 w-3.5" />
        Xem quy trình
      </Button>
    );
  }

  if (!primary) return null;

  return (
    <div className="flex items-stretch">
      {/* Confirmation popover — anchored to the primary button */}
      <Popover
        open={confirmTransition !== null}
        onOpenChange={(o) => {
          if (!o) setConfirmTransition(null);
        }}
      >
        <PopoverTrigger
          render={
            <button
              type="button"
              title={primary.actionLabel}
              onClick={() => handleSelectTransition(primary)}
              disabled={isTransitioning}
              className={`group/button inline-flex shrink-0 items-center justify-center rounded-lg border whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 ${compact ? "h-7 gap-1 px-2 text-xs font-medium border-border bg-background text-foreground hover:bg-accent" : "h-8 gap-1.5 px-2.5 text-sm font-medium border-transparent bg-primary text-primary-foreground"} ${hasDropdown ? "rounded-r-none border-r-0" : ""}`}
            />
          }
        >
          {isTransitioning && (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          )}
          {primary.actionLabel}
        </PopoverTrigger>

        {confirmTransition && (
          <PopoverContent align="end" className="w-80 p-0">
            <TransitionConfirmContent
              transition={confirmTransition}
              members={members}
              onConfirm={handleConfirm}
              onCancel={() => setConfirmTransition(null)}
              isLoading={isTransitioning}
            />
          </PopoverContent>
        )}
      </Popover>

      {/* Dropdown for secondary actions */}
      {hasDropdown && (
        <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <PopoverTrigger
            className={`inline-flex items-center justify-center rounded-l-none rounded-r-lg disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${compact ? "h-7 px-1.5 border border-border bg-background text-foreground hover:bg-accent" : "h-8 px-2 border-l border-l-primary-foreground/20 bg-primary text-primary-foreground hover:bg-primary/90"}`}
            disabled={isTransitioning}
            title="Thêm hành động"
          >
            <ChevronDown className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto min-w-[160px] p-1">
            {secondary.map((t) => (
              <button
                key={t.id}
                type="button"
                className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => {
                  handleSelectTransition(t);
                  setDropdownOpen(false);
                }}
              >
                {t.actionLabel}
              </button>
            ))}
            {onViewWorkflow && (
              <>
                {secondary.length > 0 && (
                  <div className="my-1 h-px bg-border" />
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    onViewWorkflow();
                    setDropdownOpen(false);
                  }}
                >
                  <Workflow className="h-3.5 w-3.5" />
                  Xem quy trình
                </button>
              </>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
