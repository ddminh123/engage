"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const VARIANT_MAP: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  Low: "outline",
  Medium: "secondary",
  High: "default",
  Critical: "destructive",
};

/**
 * Consistent color treatment per risk level using only shadcn design tokens.
 * Low  → outline  + green text
 * Medium → secondary + amber text
 * High → default  + orange tint (primary bg, white text)
 * Critical → destructive
 */
const CLASS_MAP: Record<string, string> = {
  Low: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Medium:
    "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400",
  High: "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Critical: "",
};

interface RiskLevelBadgeProps {
  level: string | null | undefined;
  label?: string;
  className?: string;
}

export function RiskLevelBadge({ level, label, className }: RiskLevelBadgeProps) {
  if (!level) return <span className="text-muted-foreground">—</span>;

  return (
    <Badge
      variant={VARIANT_MAP[level] ?? "outline"}
      className={cn(CLASS_MAP[level] ?? "", className)}
    >
      {label ?? level}
    </Badge>
  );
}
