"use client";

import * as React from "react";
import { COMMON_LABELS } from "@/constants/labels";

const C = COMMON_LABELS;

interface UseFormGuardOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDirty: boolean;
}

interface UseFormGuardReturn {
  requestClose: () => void;
  discardDialogOpen: boolean;
  setDiscardDialogOpen: (open: boolean) => void;
  confirmDiscard: () => void;
  discardDialogProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
    variant: "confirm";
  };
}

export function useFormGuard({
  open,
  onOpenChange,
  isDirty,
}: UseFormGuardOptions): UseFormGuardReturn {
  const [discardDialogOpen, setDiscardDialogOpen] = React.useState(false);

  // Close discard dialog when the main dialog closes
  React.useEffect(() => {
    if (!open) setDiscardDialogOpen(false);
  }, [open]);

  const requestClose = React.useCallback(() => {
    if (isDirty) {
      setDiscardDialogOpen(true);
    } else {
      onOpenChange(false);
    }
  }, [isDirty, onOpenChange]);

  const confirmDiscard = React.useCallback(() => {
    setDiscardDialogOpen(false);
    onOpenChange(false);
  }, [onOpenChange]);

  return {
    requestClose,
    discardDialogOpen,
    setDiscardDialogOpen,
    confirmDiscard,
    discardDialogProps: {
      open: discardDialogOpen,
      onOpenChange: setDiscardDialogOpen,
      title: C.confirm.discardTitle,
      description: C.confirm.discardDescription,
      confirmLabel: C.confirm.discardConfirm,
      onConfirm: confirmDiscard,
      variant: "confirm",
    },
  };
}
