"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { COMMON_LABELS } from "@/constants/labels";

const C = COMMON_LABELS;

type ConfirmVariant = "info" | "confirm" | "destructive";

const variantDefaults: Record<
  ConfirmVariant,
  {
    confirmLabel: string;
    loadingLabel: string;
    buttonVariant: "default" | "destructive";
  }
> = {
  info: {
    confirmLabel: "OK",
    loadingLabel: "OK",
    buttonVariant: "default",
  },
  confirm: {
    confirmLabel: C.action.confirm,
    loadingLabel: C.action.saving,
    buttonVariant: "default",
  },
  destructive: {
    confirmLabel: C.action.delete,
    loadingLabel: C.action.deleting,
    buttonVariant: "destructive",
  },
};

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  variant?: ConfirmVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  loadingLabel?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  variant = "destructive",
  confirmLabel,
  cancelLabel,
  isLoading = false,
  loadingLabel,
}: ConfirmDialogProps) {
  const defaults = variantDefaults[variant];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {variant !== "info" && (
            <AlertDialogCancel>
              {cancelLabel ?? C.action.cancel}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            variant={defaults.buttonVariant}
          >
            {isLoading
              ? (loadingLabel ?? defaults.loadingLabel)
              : (confirmLabel ?? defaults.confirmLabel)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type { ConfirmVariant };
