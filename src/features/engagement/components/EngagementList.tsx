"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTable/DataTableColumnHeader";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { useEngagements } from "../hooks/useEngagements";
import type { EngagementSummary } from "../types";
import type { ColumnDef } from "@tanstack/react-table";

const L = ENGAGEMENT_LABELS.engagement;

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-slate-100 text-slate-700",
  fieldwork: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  reporting: "bg-purple-100 text-purple-700",
  closed: "bg-green-100 text-green-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {L.status[status] ?? status}
    </span>
  );
}

interface EngagementListProps {
  onSelect: (engagement: EngagementSummary) => void;
  onCreate: () => void;
}

export function EngagementList({ onSelect, onCreate }: EngagementListProps) {
  const { data: engagements = [], isLoading } = useEngagements();

  const columns = React.useMemo<ColumnDef<EngagementSummary>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={L.field.title} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.title}</span>
        ),
        meta: { label: L.field.title },
      },
      {
        id: "entity",
        accessorFn: (row) => row.entity?.name ?? "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={L.field.entity} />
        ),
        cell: ({ row }) => {
          const entity = row.original.entity;
          if (!entity) return "—";
          return (
            <div>
              <div className="text-sm">{entity.name}</div>
              {entity.entityType && (
                <div className="text-xs text-muted-foreground">
                  {entity.entityType.name}
                </div>
              )}
            </div>
          );
        },
        meta: { label: L.field.entity },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={L.field.status} />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        meta: { label: L.field.status },
      },
      {
        id: "schedule",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={L.field.schedule} />
        ),
        cell: ({ row }) => {
          const e = row.original;
          return (
            <span className="text-sm text-muted-foreground">
              {new Date(e.startDate).toLocaleDateString("vi-VN")} —{" "}
              {new Date(e.endDate).toLocaleDateString("vi-VN")}
            </span>
          );
        },
        meta: { label: L.field.schedule },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={L.field.priority} />
        ),
        cell: ({ row }) => {
          const p = row.original.priority;
          if (!p) return "—";
          const variant =
            p === "high"
              ? "destructive"
              : p === "medium"
                ? "default"
                : "secondary";
          return <Badge variant={variant}>{L.priority[p] ?? p}</Badge>;
        },
        meta: { label: L.field.priority },
      },
      {
        id: "linkedPlan",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={L.field.linkedPlan} />
        ),
        cell: ({ row }) => {
          const pa = row.original.plannedAudit;
          if (!pa)
            return (
              <span className="text-xs text-muted-foreground">Độc lập</span>
            );
          return (
            <span className="text-xs text-muted-foreground">Từ kế hoạch</span>
          );
        },
        meta: { label: L.field.linkedPlan },
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={engagements}
      isLoading={isLoading}
      searchKey="title"
      searchPlaceholder={L.search}
      emptyMessage={L.noData}
      onRowClick={(row) => onSelect(row)}
      actions={
        <Button size="sm" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {L.createTitle}
        </Button>
      }
    />
  );
}
