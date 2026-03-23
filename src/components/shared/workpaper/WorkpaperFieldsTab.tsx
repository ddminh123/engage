"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface WorkpaperFieldConfig {
  key: string;
  label: string;
  render: () => ReactNode;
}

interface WorkpaperFieldsTabProps {
  fields?: WorkpaperFieldConfig[];
  children?: ReactNode;
}

export function WorkpaperFieldsTab({ fields, children }: WorkpaperFieldsTabProps) {
  if (children) {
    return <div className="space-y-4 p-3">{children}</div>;
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Không có trường thông tin nào
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {fields.map((field) => (
        <FieldRow key={field.key} label={field.label}>
          {field.render()}
        </FieldRow>
      ))}
    </div>
  );
}

export function FieldRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div>{children}</div>
    </div>
  );
}
