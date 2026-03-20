"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogSize = "sm" | "md" | "lg" | "xl";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestClose?: () => void;
  /** Hides the dialog visually without closing it — preserves all form state */
  hidden?: boolean;
  title: string;
  size?: DialogSize;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function FormDialog({
  open,
  onOpenChange,
  onRequestClose,
  hidden = false,
  title,
  size = "lg",
  children,
  footer,
}: FormDialogProps) {
  const handleClose = onRequestClose ?? (() => onOpenChange(false));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !hidden) handleClose();
      }}
    >
      <DialogContent
        size={size}
        showCloseButton={false}
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 p-0",
          hidden && "!hidden",
        )}
        overlayClassName={hidden ? "!hidden" : undefined}
      >
        {/* ── Sticky Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
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
          )}
        >
          {footer}
        </div>
      </DialogContent>
    </Dialog>
  );
}
