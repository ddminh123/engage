"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Cloud } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/dateUtils";
import type { AutoSaveStatus as Status } from "./useAutoSave";

interface AutoSaveStatusProps {
  status: Status;
  lastSavedAt?: Date | null;
  className?: string;
  /** Name of who last saved (defaults to "bạn") */
  lastSavedBy?: string;
}

export function AutoSaveIndicator({
  status,
  lastSavedAt,
  className,
  lastSavedBy = "bạn",
}: AutoSaveStatusProps) {
  // Tick every 15s to refresh relative time
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!lastSavedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  if (status === "saving") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Đang lưu...
      </span>
    );
  }

  if (status === "error") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-destructive",
          className,
        )}
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Lưu thất bại
      </span>
    );
  }

  // idle or saved — clickable popover with detail
  if (lastSavedAt) {
    return (
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              title="Chi tiết lưu tự động"
              className={cn(
                "inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors cursor-pointer",
                className,
              )}
            />
          }
        >
          <Cloud className="h-3.5 w-3.5" />
          <span>Đã lưu</span>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto max-w-[240px] p-3 text-xs"
          align="start"
        >
          <div className="space-y-1">
            <div className="font-medium text-sm">Đã lưu tự động</div>
            <div className="text-muted-foreground">
              {formatTimeAgo(lastSavedAt)} bởi {lastSavedBy}
            </div>
            <div className="text-muted-foreground">
              {lastSavedAt.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Never saved yet
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground",
        className,
      )}
    >
      <Cloud className="h-3.5 w-3.5" />
      Chưa lưu
    </span>
  );
}
