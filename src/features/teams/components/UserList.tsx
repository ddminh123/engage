"use client";

import * as React from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UserForm } from "./UserForm";
import { getUserColumns, defaultUserColumnVisibility } from "./UserColumns";
import { useUsers, useLockUser, useUnlockUser } from "../hooks/useUsers";
import { TEAMS_LABELS } from "@/constants/labels/teams";
import type { User } from "../types";

const L = TEAMS_LABELS;

export function UserList() {
  const { data: users = [], isLoading } = useUsers();
  const lockMutation = useLockUser();
  const unlockMutation = useUnlockUser();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [locking, setLocking] = useState<User | null>(null);
  const [unlocking, setUnlocking] = useState<User | null>(null);

  const handleView = React.useCallback((user: User) => {
    setEditing(user);
    setFormOpen(true);
  }, []);

  const handleEdit = React.useCallback((user: User) => {
    setEditing(user);
    setFormOpen(true);
  }, []);

  const handleLock = React.useCallback((user: User) => {
    setLocking(user);
  }, []);

  const handleUnlock = React.useCallback((user: User) => {
    setUnlocking(user);
  }, []);

  const handleLockConfirm = async () => {
    if (!locking) return;
    try {
      await lockMutation.mutateAsync(locking.id);
      setLocking(null);
    } catch {
      // handled by mutation
    }
  };

  const handleUnlockConfirm = async () => {
    if (!unlocking) return;
    try {
      await unlockMutation.mutateAsync(unlocking.id);
      setUnlocking(null);
    } catch {
      // handled by mutation
    }
  };

  const columns = React.useMemo(
    () =>
      getUserColumns({
        onView: handleView,
        onEdit: handleEdit,
        onLock: handleLock,
        onUnlock: handleUnlock,
      }),
    [handleView, handleEdit, handleLock, handleUnlock]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        defaultColumnVisibility={defaultUserColumnVisibility}
        emptyMessage="Chưa có người dùng nào."
        searchPlaceholder="Tìm người dùng..."
        actions={
          <Button
            size="sm"
            className="h-8"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {L.USER_CREATE}
          </Button>
        }
      />

      <UserForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initialData={editing}
      />

      <ConfirmDialog
        open={!!locking}
        onOpenChange={(open) => !open && setLocking(null)}
        title={L.ACTION_LOCK}
        description={L.CONFIRM_LOCK}
        confirmLabel={L.ACTION_LOCK}
        onConfirm={handleLockConfirm}
        isLoading={lockMutation.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!unlocking}
        onOpenChange={(open) => !open && setUnlocking(null)}
        title={L.ACTION_UNLOCK}
        description={L.CONFIRM_UNLOCK}
        confirmLabel={L.ACTION_UNLOCK}
        onConfirm={handleUnlockConfirm}
        isLoading={unlockMutation.isPending}
      />
    </>
  );
}
