"use client";

import { StatusBadge } from "@/components/shared/workpaper/StatusBadge";

export function WpStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;
  return <StatusBadge status={status} />;
}
