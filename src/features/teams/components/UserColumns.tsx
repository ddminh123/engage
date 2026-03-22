"use client";

import * as React from "react";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/shared/DataTable";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { TEAMS_LABELS, getRoleLabel, getStatusLabel } from "@/constants/labels/teams";
import { Pencil, Lock, Unlock, EyeOff, Eye } from "lucide-react";
import type { User } from "../types";

const L = TEAMS_LABELS;

export const defaultUserColumnVisibility: VisibilityState = {
  phone: false,
  provider: false,
  createdAt: false,
};

interface UserColumnsOptions {
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onLock: (user: User) => void;
  onUnlock: (user: User) => void;
}

export function getUserColumns({
  onView,
  onEdit,
  onLock,
  onUnlock,
}: UserColumnsOptions): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.USER_NAME} />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onView(user)}
          >
            <UserAvatar user={user} size="default" />
            <div className="min-w-0 leading-tight">
              <div className="font-medium truncate">{user.name}</div>
              {user.title && (
                <div className="text-xs text-muted-foreground truncate">
                  {user.title}
                </div>
              )}
            </div>
          </div>
        );
      },
      meta: { label: L.USER_NAME },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.USER_EMAIL} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("email")}</span>
      ),
      meta: { label: L.USER_EMAIL },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.USER_PHONE} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue("phone") || (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
      meta: { label: L.USER_PHONE },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.USER_ROLE} />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{getRoleLabel(row.getValue("role"))}</Badge>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { label: L.USER_ROLE },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.USER_STATUS} />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={
              status === "active"
                ? "default"
                : status === "locked"
                ? "destructive"
                : "secondary"
            }
          >
            {getStatusLabel(status)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { label: L.USER_STATUS },
    },
    {
      accessorKey: "provider",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.USER_PROVIDER} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("provider") === "entra_id" ? "Microsoft SSO" : "Mật khẩu"}
        </span>
      ),
      meta: { label: L.USER_PROVIDER },
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
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(user);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(user);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {user.status === "active" ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onLock(user);
                }}
              >
                <Lock className="h-3.5 w-3.5" />
              </Button>
            ) : user.status === "locked" ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlock(user);
                }}
              >
                <Unlock className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon-sm" disabled>
                <EyeOff className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      },
      meta: { label: "Thao tác" },
    },
  ];
}
