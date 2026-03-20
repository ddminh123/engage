"use client";

import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/shared/DataTable";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import { cn } from "@/lib/utils";
import type { Contact } from "../types";

const C = COMMON_LABELS;
const LC = SETTINGS_LABELS.contact;

/** Columns hidden by default — user can toggle via column selector */
export const defaultContactColumnVisibility: VisibilityState = {
  position: false,
  createdAt: false,
};

export const contactColumns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={C.field.name} />
    ),
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="leading-tight">
          <div className="font-medium">{contact.name}</div>
          {contact.position && (
            <div className="text-xs text-muted-foreground">
              {contact.position}
            </div>
          )}
        </div>
      );
    },
    meta: { label: C.field.name },
  },
  {
    accessorKey: "position",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={C.field.position} />
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {row.getValue("position") || (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    ),
    meta: { label: C.field.position },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={C.field.email} />
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {row.getValue("email") || (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    ),
    meta: { label: C.field.email },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={C.field.phone} />
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {row.getValue("phone") || (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    ),
    meta: { label: C.field.phone },
  },
  {
    accessorKey: "unitName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={LC.field.unit} />
    ),
    cell: ({ row, table }) => {
      const unitName = row.getValue("unitName") as string | null;
      const unitId = row.original.unitId;
      if (!unitName) return <span className="text-muted-foreground">—</span>;
      const onOrgUnitClick = (table.options.meta as Record<string, unknown>)
        ?.onOrgUnitClick as ((id: string) => void) | undefined;
      return (
        <span
          className={cn(
            "text-sm",
            onOrgUnitClick && unitId && "cursor-pointer hover:underline",
          )}
          onClick={(e) => {
            if (onOrgUnitClick && unitId) {
              e.stopPropagation();
              onOrgUnitClick(unitId);
            }
          }}
        >
          {unitName}
        </span>
      );
    },
    meta: { label: LC.field.unit },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={C.field.status} />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status === "active" ? LC.status.active : LC.status.inactive}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    meta: { label: C.field.status },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cập nhật" />
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
    meta: { label: "Cập nhật" },
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
];
