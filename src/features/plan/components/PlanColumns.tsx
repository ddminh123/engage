"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/shared/DataTable";
import { PLAN_LABELS } from "@/constants/labels";
import type { PlanSummary } from "../types";

const L = PLAN_LABELS.plan;

export function getPlanColumns(): ColumnDef<PlanSummary>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.title} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
      meta: { label: L.field.title },
    },
    {
      accessorKey: "periodType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.periodType} />
      ),
      cell: ({ row }) => {
        const type = row.getValue("periodType") as string;
        return <span className="text-sm">{L.periodType[type] ?? type}</span>;
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { label: L.field.periodType },
    },
    {
      id: "period",
      accessorFn: (row) => row.periodStart,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.period} />
      ),
      cell: ({ row }) => {
        const start = new Date(row.original.periodStart).toLocaleDateString("vi-VN");
        const end = new Date(row.original.periodEnd).toLocaleDateString("vi-VN");
        return (
          <span className="text-sm text-muted-foreground">
            {start} — {end}
          </span>
        );
      },
      meta: { label: L.field.period },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.status} />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const label = L.status[status] ?? status;
        const variant =
          status === "approved"
            ? "default"
            : status === "in_progress"
              ? "secondary"
              : status === "closed"
                ? "outline"
                : "secondary";
        return <Badge variant={variant}>{label}</Badge>;
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { label: L.field.status },
    },
    {
      accessorKey: "auditCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.auditCount} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("auditCount")}</span>
      ),
      meta: { label: L.field.auditCount },
    },
    {
      id: "progress",
      accessorFn: (row) =>
        row.auditCount > 0
          ? Math.round((row.completedCount / row.auditCount) * 100)
          : 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.progress} />
      ),
      cell: ({ row }) => {
        const plan = row.original;
        if (plan.auditCount === 0)
          return <span className="text-muted-foreground">—</span>;
        const pct = Math.round(
          (plan.completedCount / plan.auditCount) * 100,
        );
        return (
          <span className="text-sm">
            {plan.completedCount}/{plan.auditCount} ({pct}%)
          </span>
        );
      },
      meta: { label: L.field.progress },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.updatedAt} />
      ),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        );
      },
      meta: { label: L.field.updatedAt },
    },
  ];
}
