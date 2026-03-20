"use client";

import * as React from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMMON_LABELS } from "@/constants/labels";

const C = COMMON_LABELS;

// =============================================================================
// SIZE
// =============================================================================

const sheetSizeClasses = {
  sm: "w-[400px] sm:max-w-[400px]",
  md: "w-[540px] sm:max-w-[540px]",
  lg: "w-[720px] sm:max-w-[720px]",
} as const;

type SheetSize = keyof typeof sheetSizeClasses;

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface DetailFieldProps {
  label: string;
  children: React.ReactNode;
}

function DetailField({ label, children }: DetailFieldProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm">{children ?? "—"}</div>
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
  columns?: 1 | 2;
  hideDivider?: boolean;
}

function DetailSection({
  title,
  children,
  columns = 1,
  hideDivider = false,
}: DetailSectionProps) {
  return (
    <div className="space-y-3">
      {!hideDivider && <Separator />}
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div
        className={cn(
          columns === 2 ? "grid grid-cols-2 gap-x-6 gap-y-3" : "space-y-3",
        )}
      >
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  size?: SheetSize;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  pageHref?: string;
  children: React.ReactNode;
}

function DetailSheet({
  open,
  onOpenChange,
  title,
  size = "md",
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  pageHref,
  children,
}: DetailSheetProps) {
  const hasActions = onEdit || onDelete;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className={cn("flex flex-col gap-0 p-0", sheetSizeClasses[size])}
      >
        {/* ── Sticky Header ── */}
        <div className="shrink-0 border-b px-6 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="truncate text-lg">{title}</SheetTitle>
            <div className="flex items-center gap-1">
              {pageHref && (
                <Link
                  href={pageHref}
                  target="_blank"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Open page</span>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
          {hasActions && (
            <div className="flex items-center gap-3 mt-1">
              {onEdit && (
                <Button size="sm" onClick={onEdit}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  {editLabel ?? C.action.edit}
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onDelete}
                  className="h-auto p-0 text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  {deleteLabel ?? C.action.delete}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { DetailSheet, DetailSection, DetailField };
export type { SheetSize };
