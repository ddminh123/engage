"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const CLASS_MAP: Record<string, string> = {
  Strong:
    "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Medium:
    "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Weak: "border-red-300 bg-red-50 text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-red-950 dark:text-red-400",
};

interface ControlEffectivenessBadgeProps {
  value: string | null | undefined;
  label?: string;
  className?: string;
}

export function ControlEffectivenessBadge({
  value,
  label,
  className,
}: ControlEffectivenessBadgeProps) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge
      variant="outline"
      className={cn(CLASS_MAP[value] ?? "", className)}
    >
      {label ?? value}
    </Badge>
  );
}
