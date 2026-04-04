"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ── Version Save Content (rendered inside a Popover by PlanningWorkpaperOverlay) ──

interface VersionSaveContentProps {
  onConfirm: (description: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VersionSaveContent({
  onConfirm,
  onCancel,
  isLoading = false,
}: VersionSaveContentProps) {
  const [description, setDescription] = React.useState("");

  const handleConfirm = async () => {
    await onConfirm(description.trim() || "");
  };

  return (
    <div className="p-3 space-y-3">
      <div>
        <div className="font-medium text-sm">Lưu phiên bản</div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Thêm mô tả cho phiên bản này (tùy chọn)
        </p>
      </div>

      {/* Description field */}
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
        />
      </div>

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
          {isLoading && (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          )}
          Lưu
        </Button>
      </div>
    </div>
  );
}
