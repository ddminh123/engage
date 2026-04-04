"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }, [description, onConfirm, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    setDescription("");
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 space-y-3">
          {/* Header */}
          <div>
            <div className="font-medium text-sm">Mô tả phiên bản</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Thêm hoặc chỉnh sửa mô tả
            </p>
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <Label htmlFor="version-desc" className="text-xs">
              Mô tả{" "}
              <span className="text-muted-foreground font-normal">
                (tùy chọn)
              </span>
            </Label>
            <Textarea
              id="version-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
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
      </PopoverContent>
    </Popover>
  );
}
