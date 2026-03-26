"use client";

import { cn } from "@/lib/utils";
import { useStatusMap } from "@/features/settings/hooks/useApprovalStatuses";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Convert a hex color to an rgba background with low opacity for badge bg.
 */
function hexToLightBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap = useStatusMap();
  const info = statusMap.get(status);

  const label = info?.label ?? status;
  const color = info?.color ?? "#94a3b8";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={{ backgroundColor: hexToLightBg(color), color }}
    >
      <span
        className="inline-block size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

/**
 * Static version that doesn't fetch — used when status map data isn't available yet.
 * Falls back to muted styling.
 */
export function StaticStatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground",
        className,
      )}
    >
      <span className="inline-block size-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
      {status}
    </span>
  );
}
