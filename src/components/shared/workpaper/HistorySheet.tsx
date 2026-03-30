"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  FileSearch,
  FileClock,
  ShieldCheck,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type {
  WpSignoff,
  EntityVersionSummary,
} from "@/features/engagement/types";

// ── Sign-off config ──

const SIGNOFF_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  prepare: {
    label: "Thực hiện",
    icon: FileCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  review: {
    label: "Soát xét",
    icon: FileSearch,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  approve: {
    label: "Phê duyệt",
    icon: ShieldCheck,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
};

const SIGNOFF_ORDER = ["prepare", "review", "approve"] as const;

// ── Helpers ──

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
  signoffs: WpSignoff[];
  versions: EntityVersionSummary[];
  entityType: string;
  entityId: string;
  currentVersion: number;
  onViewVersion?: (version: number) => void;
  onRestoreVersion?: (version: number) => void;
  isRestoring?: boolean;
  trigger?: React.ReactNode;
}

export function HistorySheet({
  signoffs,
  versions,
  entityType,
  entityId,
  currentVersion,
  onViewVersion,
  onRestoreVersion,
  isRestoring,
  trigger,
}: HistorySheetProps) {
  // Filter signoffs for this entity
  const entitySignoffs = signoffs.filter(
    (s) => s.entityType === entityType && s.entityId === entityId,
  );

  return (
    <Sheet>
      <SheetTrigger
        render={
          trigger ? undefined : (
            <button
              type="button"
              title="Lịch sử phê duỵệt và phiên bản"
              className="inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
            />
          )
        }
      >
        {trigger ?? (
          <>
            <FileClock className="h-3.5 w-3.5" />
            <span>Phiên bản</span>
          </>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0">
        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle>Quản lý phiên bản</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="signoffs" className="flex-1 overflow-hidden mt-2">
          <TabsList variant="line" className="mx-4">
            <TabsTrigger value="signoffs" className="text-xs">
              Phê duyệt
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-xs">
              Phiên bản ({versions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signoffs" className="overflow-y-auto px-4 pb-4">
            <SignoffList
              signoffs={entitySignoffs}
              currentVersion={currentVersion}
              onViewVersion={onViewVersion}
            />
          </TabsContent>

          <TabsContent value="versions" className="overflow-y-auto px-4 pb-4">
            <VersionList
              versions={versions}
              currentVersion={currentVersion}
              onView={onViewVersion}
              onRestore={onRestoreVersion}
              isRestoring={isRestoring}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ── Signoff List ──

function SignoffList({
  signoffs,
  currentVersion,
  onViewVersion,
}: {
  signoffs: WpSignoff[];
  currentVersion: number;
  onViewVersion?: (version: number) => void;
}) {
  return (
    <div className="space-y-4 pt-3">
      {SIGNOFF_ORDER.map((type) => {
        const config = SIGNOFF_TYPE_CONFIG[type];
        const items = signoffs.filter((s) => s.signoffType === type);
        const Icon = config.icon;

        return (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", config.color)} />
              <span className="text-sm font-medium">{config.label}</span>
            </div>

            {items.length === 0 ? (
              <div className="ml-6 text-xs text-muted-foreground italic">
                Chưa ký
              </div>
            ) : (
              <div className="ml-6 space-y-1.5">
                {items.map((s) => (
                  <SignoffRow
                    key={s.id}
                    signoff={s}
                    config={config}
                    currentVersion={currentVersion}
                    onViewVersion={onViewVersion}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SignoffRow({
  signoff,
  config,
  currentVersion,
  onViewVersion,
}: {
  signoff: WpSignoff;
  config: (typeof SIGNOFF_TYPE_CONFIG)[string];
  currentVersion: number;
  onViewVersion?: (version: number) => void;
}) {
  const isInvalidated = !!signoff.invalidatedAt;
  const isCurrent =
    signoff.version != null && signoff.version === currentVersion;
  const canClickVersion =
    signoff.version != null && !isCurrent && !!onViewVersion;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-md border p-2.5",
        isInvalidated
          ? "bg-orange-50 border-orange-200"
          : cn(config.bgColor, "border-transparent"),
      )}
    >
      <div className="mt-0.5">
        {isInvalidated ? (
          <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {signoff.user.avatarUrl && (
              <AvatarImage src={signoff.user.avatarUrl} />
            )}
            <AvatarFallback>{getInitials(signoff.user.name)}</AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "text-sm font-medium",
              isInvalidated && "line-through text-orange-600",
            )}
          >
            {signoff.user.name}
          </span>
          <span className="text-xs text-muted-foreground">
            · {formatDate(signoff.signedAt)}
          </span>
        </div>
        {signoff.version != null && (
          <div className="mt-1 ml-7">
            {canClickVersion ? (
              <button
                type="button"
                className="text-xs text-primary hover:underline cursor-pointer"
                onClick={() => onViewVersion!(signoff.version!)}
              >
                Xem phiên bản v{signoff.version}
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Phiên bản v{signoff.version}
                {isCurrent && " (hiện tại)"}
              </span>
            )}
          </div>
        )}
        {isInvalidated && (
          <div className="text-orange-500 flex items-center gap-1 mt-1 ml-7 text-xs">
            <Clock className="h-3 w-3" />
            <span>Đã thay đổi — {formatDate(signoff.invalidatedAt!)}</span>
          </div>
        )}
        {signoff.comment && (
          <div className="text-xs text-muted-foreground mt-1 ml-7 italic">
            &ldquo;{signoff.comment}&rdquo;
          </div>
        )}
      </div>
    </div>
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
