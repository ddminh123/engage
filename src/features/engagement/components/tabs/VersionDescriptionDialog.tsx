"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface VersionDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (description: string) => Promise<void>;
}

export function VersionDescriptionDialog({
  open,
  onOpenChange,
  onConfirm,
}: VersionDescriptionDialogProps) {
  const [description, setDescription] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await onConfirm(description);
      setDescription("");
    } finally {
      setIsLoading(false);
    }
  }, [description, onConfirm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-medium">
            Lưu phiên bản
          </DialogTitle>
          <DialogDescription className="text-xs">
            Thêm mô tả cho phiên bản này (tùy chọn)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="version-desc" className="text-xs">
              Mô tả
            </Label>
            <Textarea
              id="version-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả..."
              rows={2}
              className="resize-none text-sm"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDescription("");
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Lưu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
