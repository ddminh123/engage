"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { COMMON_LABELS } from "@/constants/labels";

const C = COMMON_LABELS;

interface DetailPageLayoutProps {
  title: string;
  backHref: string;
  backLabel?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
}

export function DetailPageLayout({
  title,
  backHref,
  backLabel = "Quay lại",
  onEdit,
  onDelete,
  children,
  isLoading,
}: DetailPageLayoutProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-0 py-2">
      {/* Back nav */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between pt-5">
        <h1 className="text-2xl font-bold leading-tight">{title}</h1>
        {(onEdit || onDelete) && (
          <div className="ml-4 flex shrink-0 items-center gap-2">
            {onEdit && (
              <Button size="sm" onClick={onEdit}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                {C.action.edit}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="link"
                size="sm"
                onClick={onDelete}
                className="h-auto p-0 text-destructive hover:text-destructive/80"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                {C.action.delete}
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator className="mt-4 mb-5" />

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">{children}</div>
      )}
    </div>
  );
}
