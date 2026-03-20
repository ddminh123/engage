"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  WP_LABELS,
  PROCEDURE_STATUS_DOT,
} from "../tabs/workProgramTypes";

export function WpStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const dot = PROCEDURE_STATUS_DOT[status] ?? "bg-muted-foreground/30";
  const label = WP_LABELS.procedure.status[status] ?? status;
  return (
    <Badge variant="outline" className="text-[10px] gap-1.5">
      <span className={cn("inline-block size-2 shrink-0 rounded-full", dot)} />
      {label}
    </Badge>
  );
}
