"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sheetSizeClasses = {
  sm: "w-[400px] sm:max-w-[400px]",
  md: "w-[540px] sm:max-w-[540px]",
  lg: "w-[720px] sm:max-w-[720px]",
  xl: "w-[50vw] sm:max-w-[50vw]",
} as const;

type FormSheetSize = keyof typeof sheetSizeClasses;

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestClose?: () => void;
  /** Hides the sheet visually without closing it — preserves all form state */
  hidden?: boolean;
  title: string;
  size?: FormSheetSize;
  children: React.ReactNode;
  footer: React.ReactNode;
  /** Override footer container className (default: flex items-center justify-end gap-2) */
  footerClassName?: string;
}

export function FormSheet({
  open,
  onOpenChange,
  onRequestClose,
  hidden = false,
  title,
  size = "lg",
  children,
  footer,
  footerClassName,
}: FormSheetProps) {
  const handleClose = onRequestClose ?? (() => onOpenChange(false));

  return (
    <Sheet
      open={open && !hidden}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <SheetContent
        showCloseButton={false}
        className={cn("flex flex-col gap-0 p-0", sheetSizeClasses[size])}
      >
        {/* ── Sticky Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <SheetTitle>{title}</SheetTitle>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* ── Sticky Footer ── */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-end gap-2 border-t bg-muted/50 px-6 py-4",
            footerClassName,
          )}
        >
          {footer}
        </div>
      </SheetContent>
    </Sheet>
  );
}
