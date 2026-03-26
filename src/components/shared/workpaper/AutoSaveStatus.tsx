"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, AlertCircle, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutoSaveStatus as Status } from "./useAutoSave";

interface AutoSaveStatusProps {
  status: Status;
  lastSavedAt?: Date | null;
  className?: string;
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "vừa xong";
  if (seconds < 60) return `${seconds} giây trước`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  return `${hours} giờ trước`;
}

export function AutoSaveIndicator({
  status,
  lastSavedAt,
  className,
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
          "inline-flex items-center gap-1 text-xs text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Đang lưu...
      </span>
    );
  }

  if (status === "error") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-destructive",
          className,
        )}
      >
        <AlertCircle className="h-3 w-3" />
        Lưu thất bại
      </span>
    );
  }

  // idle or saved — show last saved time
  if (lastSavedAt) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-muted-foreground",
          status === "saved" && "text-green-600",
          className,
        )}
      >
        {status === "saved" ? (
          <Check className="h-3 w-3" />
        ) : (
          <Cloud className="h-3 w-3" />
        )}
        Đã lưu {formatRelativeTime(lastSavedAt)}
      </span>
    );
  }

  // Never saved yet
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground/50",
        className,
      )}
    >
      <Cloud className="h-3 w-3" />
    </span>
  );
}
