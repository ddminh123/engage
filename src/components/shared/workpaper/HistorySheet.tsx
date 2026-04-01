"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { AlertCircle, Cloud, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/dateUtils";
import type { AutoSaveStatus as SaveStatus } from "./useAutoSave";
import type { EntityVersionSummary } from "@/features/engagement/types";

// ── Helpers ──

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Props ──

interface HistorySheetProps {
  versions: EntityVersionSummary[];
  currentVersion: number;
  onViewVersion?: (version: number) => void;
  onRestoreVersion?: (version: number) => void;
  isRestoring?: boolean;
  trigger?: React.ReactNode;
  /** Auto-save state — when provided, renders a combined save + version trigger */
  autoSaveStatus?: SaveStatus;
  autoSaveLastSavedAt?: Date | null;
}

export function HistorySheet({
  versions,
  currentVersion,
  onViewVersion,
  onRestoreVersion,
  isRestoring,
  trigger,
  autoSaveStatus,
  autoSaveLastSavedAt,
}: HistorySheetProps) {
  // Tick every 15s to refresh relative time
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!autoSaveLastSavedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, [autoSaveLastSavedAt]);

  const versionLabel = `v${currentVersion}`;

  // Build combined trigger when autoSaveStatus is provided
  const combinedTrigger = React.useMemo(() => {
    if (trigger) return trigger;
    if (autoSaveStatus === undefined) return null;

    if (autoSaveStatus === "saving") {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{versionLabel}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>Đang lưu…</span>
        </span>
      );
    }

    if (autoSaveStatus === "error") {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{versionLabel}</span>
          <span className="text-destructive/40">·</span>
          <span>Lưu thất bại</span>
        </span>
      );
    }

    // idle or saved
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Cloud className="h-3 w-3" />
        <span>{versionLabel}</span>
        <span className="text-muted-foreground/40">·</span>
        <span>
          {autoSaveLastSavedAt
            ? `Đã lưu ${formatTimeAgo(autoSaveLastSavedAt)}`
            : "Chưa lưu"}
        </span>
      </span>
    );
  }, [trigger, autoSaveStatus, autoSaveLastSavedAt, versionLabel]);

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            title={
              autoSaveLastSavedAt
                ? `Đã lưu ${formatTimeAgo(autoSaveLastSavedAt)} · Nhấn để xem phiên bản`
                : "Xem phiên bản"
            }
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 decoration-muted-foreground/30 hover:decoration-foreground/50 hover:text-foreground transition-colors cursor-pointer whitespace-nowrap"
          />
        }
      >
        {combinedTrigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>Phiên bản ({versions.length})</SheetTitle>
        </SheetHeader>
        {autoSaveLastSavedAt && (
          <div className="px-4 pb-2 text-xs text-muted-foreground">
            Đã lưu tự động {formatTimeAgo(autoSaveLastSavedAt)} ·{" "}
            {autoSaveLastSavedAt.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
        <div className="overflow-y-auto px-4 pb-4">
          <VersionList
            versions={versions}
            currentVersion={currentVersion}
            onView={onViewVersion}
            onRestore={onRestoreVersion}
            isRestoring={isRestoring}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Version List ──

function VersionList({
  versions,
  currentVersion,
  onView,
  onRestore,
  isRestoring,
}: {
  versions: EntityVersionSummary[];
  currentVersion: number;
  onView?: (version: number) => void;
  onRestore?: (version: number) => void;
  isRestoring?: boolean;
}) {
  if (versions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        Chưa có phiên bản nào.
      </p>
    );
  }

  return (
    <div className="divide-y pt-1">
      {versions.map((v) => (
        <div
          key={v.id}
          className={cn(
            "py-2.5 space-y-0.5",
            v.version === currentVersion &&
              "bg-primary/5 -mx-2 px-2 rounded-md",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              v{v.version}
              {v.actionLabel && (
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  — {v.actionLabel}
                </span>
              )}
              {v.version === currentVersion && (
                <Badge variant="secondary" className="text-[10px] h-4 ml-1.5">
                  Hiện tại
                </Badge>
              )}
            </span>
            <div className="flex items-center gap-1">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[11px] px-1.5"
                  onClick={() => onView(v.version)}
                >
                  Xem phiên bản
                </Button>
              )}
              {onRestore && v.version !== currentVersion && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[11px] px-1.5 text-orange-600 hover:text-orange-700"
                  onClick={() => onRestore(v.version)}
                  disabled={isRestoring}
                >
                  Khôi phục
                </Button>
              )}
            </div>
          </div>
          {v.comment && (
            <p className="text-xs text-muted-foreground truncate">
              {v.comment}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{v.publisher.name}</span>
            <span>·</span>
            <span>{formatDate(v.publishedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
