"use client";

import * as React from "react";
import { Loader2, ChevronDown, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AvailableTransition } from "@/features/engagement/types";

interface WorkpaperActionsProps {
  transitions: AvailableTransition[];
  onTransition: (transitionId: string) => void;
  isTransitioning?: boolean;
  onViewWorkflow?: () => void;
}

export function WorkpaperActions({
  transitions,
  onTransition,
  isTransitioning = false,
  onViewWorkflow,
}: WorkpaperActionsProps) {
  const [open, setOpen] = React.useState(false);

  if (transitions.length === 0 && !onViewWorkflow) return null;

  // Primary = first transition (highest priority per sort_order)
  const primary = transitions[0] ?? null;
  const secondary = transitions.slice(1);
  const hasDropdown = secondary.length > 0 || !!onViewWorkflow;

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
      <Button
        onClick={() => onTransition(primary.id)}
        disabled={isTransitioning}
        className={hasDropdown ? "rounded-r-none" : ""}
      >
        {isTransitioning && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
        {primary.actionLabel}
      </Button>

      {hasDropdown && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className="inline-flex items-center justify-center rounded-l-none rounded-r-md border-l border-l-primary-foreground/20 bg-primary px-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
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
                  onTransition(t.id);
                  setOpen(false);
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
                    setOpen(false);
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
