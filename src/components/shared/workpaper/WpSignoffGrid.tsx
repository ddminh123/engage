"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  FileSearch,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { WpSignoff } from "@/features/engagement/types";
import { cn } from "@/lib/utils";

// ── Config ──

const SIGNOFF_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  prepare: {
    label: "Thực hiện",
    icon: FileCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  review: {
    label: "Soát xét",
    icon: FileSearch,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  approve: {
    label: "Phê duyệt",
    icon: ShieldCheck,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
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

// ── Component ──

interface WpSignoffGridProps {
  signoffs: WpSignoff[];
  entityType: string;
  entityId: string;
}

export function WpSignoffGrid({
  signoffs,
  entityType,
  entityId,
}: WpSignoffGridProps) {
  // Filter signoffs for this entity
  const entitySignoffs = signoffs.filter(
    (s) => s.entityType === entityType && s.entityId === entityId,
  );

  if (entitySignoffs.length === 0) return null;

  // Group by signoff type, ordered
  const grouped = SIGNOFF_ORDER.map((type) => ({
    type,
    config: SIGNOFF_TYPE_CONFIG[type],
    items: entitySignoffs.filter((s) => s.signoffType === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex items-center gap-2">
      {grouped.map(({ type, config, items }) => {
        // Show the latest sign-off for each type
        const latest = items[items.length - 1];
        const isInvalidated = !!latest.invalidatedAt;
        const Icon = config.icon;

        return (
          <Popover key={type}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  title={`${config.label} — ${latest.user.name}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs cursor-pointer transition-colors",
                    isInvalidated
                      ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
                      : cn(config.bgColor, "hover:opacity-80"),
                  )}
                />
              }
            >
              {isInvalidated ? (
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
              ) : (
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              )}
              <Avatar size="sm">
                {latest.user.avatarUrl && (
                  <AvatarImage src={latest.user.avatarUrl} />
                )}
                <AvatarFallback>{getInitials(latest.user.name)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "font-medium",
                  isInvalidated ? "text-orange-600 line-through" : config.color,
                )}
              >
                {latest.user.name.split(" ").pop()}
              </span>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3">
              <div className="space-y-2">
                <div className="text-sm font-semibold">{config.label}</div>
                {items.map((s) => (
                  <div key={s.id} className="flex items-start gap-2 text-xs">
                    <div className="mt-0.5">
                      {s.invalidatedAt ? (
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{s.user.name}</span>
                      <span className="text-muted-foreground ml-1">
                        {formatDate(s.signedAt)}
                      </span>
                      {s.version != null && (
                        <span className="text-muted-foreground ml-1">
                          (v{s.version})
                        </span>
                      )}
                      {s.invalidatedAt && (
                        <div className="text-orange-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          Đã thay đổi sau ký duyệt —{" "}
                          {formatDate(s.invalidatedAt)}
                        </div>
                      )}
                      {s.comment && (
                        <div className="text-muted-foreground mt-0.5 italic">
                          &ldquo;{s.comment}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
