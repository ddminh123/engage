"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import type { DraftFinding } from "../../types";

const LF = ENGAGEMENT_LABELS.finding;

const RISK_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const STATUS_DOT: Record<string, string> = {
  draft: "bg-muted-foreground/40",
  to_review: "bg-amber-500",
  reviewed: "bg-blue-500",
  accepted: "bg-emerald-500",
  rejected: "bg-red-500",
};

export function getFindingColumns(
  onClickTitle?: (finding: DraftFinding) => void,
): ColumnDef<DraftFinding>[] {
  return [
    {
      accessorKey: "title",
      header: LF.field.title,
      cell: ({ row }) => {
        const f = row.original;
        return (
          <span
            className="font-medium cursor-pointer hover:underline"
            onClick={() => onClickTitle?.(f)}
          >
            {f.title}
          </span>
        );
      },
    },
    {
      accessorKey: "riskRating",
      header: LF.field.riskRating,
      cell: ({ row }) => {
        const val = row.original.riskRating;
        if (!val) return <span className="text-muted-foreground">—</span>;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${RISK_COLORS[val] ?? "bg-muted text-muted-foreground"}`}
          >
            {LF.riskRating[val] ?? val}
          </span>
        );
      },
      size: 120,
    },
    {
      accessorKey: "status",
      header: LF.field.status,
      cell: ({ row }) => {
        const val = row.original.status;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${STATUS_DOT[val] ?? "bg-muted-foreground/40"}`}
            />
            <span className="text-xs">{LF.status[val] ?? val}</span>
          </div>
        );
      },
      size: 130,
    },
    {
      accessorKey: "linkedProcedures",
      header: LF.field.linkedProcedures,
      cell: ({ row }) => {
        const procs = row.original.linkedProcedures;
        if (procs.length === 0)
          return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {procs.map((p) => (
              <Badge key={p.id} variant="outline" className="text-xs">
                {p.title}
              </Badge>
            ))}
          </div>
        );
      },
      size: 200,
    },
    {
      id: "owners",
      header: "Chủ sở hữu",
      cell: ({ row }) => {
        const f = row.original;
        const owners = [
          ...f.riskOwners.map((o) => o.name),
          ...f.unitOwners.map((o) => o.name),
        ];
        if (owners.length === 0)
          return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {owners.map((name, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        );
      },
      size: 180,
    },
  ];
}
