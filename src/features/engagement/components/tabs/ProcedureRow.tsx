"use client";

import { Pencil, Trash2, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import type { EngagementProcedure } from "../../types";

const LP = ENGAGEMENT_LABELS.procedure;

const PROC_STATUS_OPTIONS = Object.entries(LP.status).map(([v, l]) => ({
  value: v,
  label: l,
}));

interface ProcedureRowProps {
  proc: EngagementProcedure;
  indent: number;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}

export function ProcedureRow({
  proc,
  indent,
  onEdit,
  onDelete,
  onStatusChange,
}: ProcedureRowProps) {
  const pl = indent === 0 ? "pl-2" : indent === 1 ? "pl-8" : "pl-12";
  return (
    <div
      className={`group flex items-center justify-between py-1.5 pr-1 text-sm ${pl}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ClipboardList className="h-3.5 w-3.5 shrink-0 text-violet-500" />
        <span className="truncate">{proc.title}</span>
        {proc.procedureType && (
          <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">
            {LP.procedureType[proc.procedureType] ?? proc.procedureType}
          </Badge>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <div className="w-[130px]" onClick={(e) => e.stopPropagation()}>
          <LabeledSelect
            value={proc.status}
            onChange={onStatusChange}
            options={PROC_STATUS_OPTIONS}
            className="h-7 text-xs"
          />
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 group-hover:opacity-100"
          onClick={onEdit}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive opacity-0 hover:text-destructive group-hover:opacity-100"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
