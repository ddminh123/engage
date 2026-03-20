"use client";

import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/shared/DataTable";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import { cn } from "@/lib/utils";
import type { OrgUnit } from "../types";

const L = SETTINGS_LABELS.orgUnit;
const C = COMMON_LABELS;

/** Columns hidden by default — user can toggle via column selector */
export const defaultOrgUnitColumnVisibility: VisibilityState = {
  code: false,
  parentName: false,
  description: false,
  established: false,
  discontinued: false,
  createdAt: false,
};

interface OrgUnitColumnsOptions {
  onEdit?: (unit: OrgUnit) => void;
  onAddChild?: (unit: OrgUnit) => void;
}

export function getOrgUnitColumns({
  onEdit,
  onAddChild,
}: OrgUnitColumnsOptions = {}): ColumnDef<OrgUnit>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.name} />
      ),
      cell: ({ row }) => {
        const depth = row.depth;
        const canExpand = row.getCanExpand();

        return (
          <div
            className="flex items-center"
            style={{ paddingLeft: `${depth * 1.5}rem` }}
          >
            {canExpand ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="mr-1 h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  row.toggleExpanded();
                }}
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    row.getIsExpanded() && "rotate-90",
                  )}
                />
              </Button>
            ) : (
              <span className="mr-1 inline-block w-5" />
            )}
            <span className="font-medium">{row.getValue("name")}</span>
            {row.original.code && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({row.original.code})
              </span>
            )}
          </div>
        );
      },
      meta: { label: L.field.name },
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.code} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue("code") || (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
      meta: { label: L.field.code },
    },
    {
      accessorKey: "parentName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Đơn vị cha" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue("parentName") || (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
      meta: { label: "Đơn vị cha" },
    },
    {
      id: "leader",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.section.leader} />
      ),
      cell: ({ row }) => {
        const leader = row.original.leader;
        if (!leader) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="leading-tight">
            <div className="text-sm font-medium">{leader.name}</div>
            {leader.position && (
              <div className="text-xs text-muted-foreground">
                {leader.position}
              </div>
            )}
          </div>
        );
      },
      meta: { label: L.section.leader },
    },
    {
      id: "leaderContact",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.leaderContact} />
      ),
      cell: ({ row }) => {
        const leader = row.original.leader;
        if (!leader?.email && !leader?.phone)
          return <span className="text-muted-foreground">—</span>;
        return (
          <div className="leading-tight text-sm">
            {leader.email && <div>{leader.email}</div>}
            {leader.phone && (
              <div className="text-xs text-muted-foreground">
                {leader.phone}
              </div>
            )}
          </div>
        );
      },
      meta: { label: L.field.leaderContact },
    },
    {
      id: "contactPoint",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.section.contactPoint} />
      ),
      cell: ({ row }) => {
        const cp = row.original.contactPoint;
        if (!cp) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="leading-tight">
            <div className="text-sm font-medium">{cp.name}</div>
            {cp.position && (
              <div className="text-xs text-muted-foreground">{cp.position}</div>
            )}
          </div>
        );
      },
      meta: { label: L.section.contactPoint },
    },
    {
      id: "contactPointContact",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={L.field.contactPointContact}
        />
      ),
      cell: ({ row }) => {
        const cp = row.original.contactPoint;
        if (!cp?.email && !cp?.phone)
          return <span className="text-muted-foreground">—</span>;
        return (
          <div className="leading-tight text-sm">
            {cp.email && <div>{cp.email}</div>}
            {cp.phone && (
              <div className="text-xs text-muted-foreground">{cp.phone}</div>
            )}
          </div>
        );
      },
      meta: { label: L.field.contactPointContact },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.status} />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? C.status.active : C.status.inactive}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      meta: { label: L.field.status },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.updatedAt} />
      ),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        );
      },
      meta: { label: L.field.updatedAt },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày tạo" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        );
      },
      meta: { label: "Ngày tạo" },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={C.field.description} />
      ),
      cell: ({ row }) => (
        <span className="text-sm max-w-[200px] truncate block">
          {row.getValue("description") || (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
      meta: { label: C.field.description },
    },
    {
      accessorKey: "established",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày thành lập" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("established") as string;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        );
      },
      meta: { label: "Ngày thành lập" },
    },
    {
      accessorKey: "discontinued",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày giải thể" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("discontinued") as string;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        );
      },
      meta: { label: "Ngày giải thể" },
    },
  ];
}
