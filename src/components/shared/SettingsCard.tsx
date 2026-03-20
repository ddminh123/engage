"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export function SettingsCard({
  icon: Icon,
  title,
  description,
  onClick,
  badge,
  className,
}: SettingsCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent/50",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
}
