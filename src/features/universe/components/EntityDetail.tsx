"use client";

import * as React from "react";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { COMMON_LABELS, UNIVERSE_LABELS } from "@/constants/labels";
import { PAGE_ROUTES } from "@/constants";
import { useUpdateEntity, useDeleteEntity } from "../hooks/useEntities";
import { EntityForm } from "./EntityForm";
import { EntityContent } from "./EntityContent";
import type { AuditableEntity, EntityInput } from "../types";

const L = UNIVERSE_LABELS.entity;
const C = COMMON_LABELS;

interface EntityDetailProps {
  entity: AuditableEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange?: () => void;
}

export function EntityDetail({
  entity,
  open,
  onOpenChange,
  onChange,
}: EntityDetailProps) {
  // Internal edit state
  const [editFormOpen, setEditFormOpen] = React.useState(false);
  const [editingEntity, setEditingEntity] =
    React.useState<AuditableEntity | null>(null);

  // Internal delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingEntity, setDeletingEntity] =
    React.useState<AuditableEntity | null>(null);

  const updateMutation = useUpdateEntity();
  const deleteMutation = useDeleteEntity();

  // ── Edit handlers ──
  const handleEdit = () => {
    if (!entity) return;
    setEditingEntity(entity);
    onOpenChange(false);
    setEditFormOpen(true);
  };

  const handleEditFormSubmit = async (data: EntityInput) => {
    if (!editingEntity) return;
    try {
      await updateMutation.mutateAsync({ id: editingEntity.id, data });
      setEditFormOpen(false);
      setEditingEntity(null);
      onChange?.();
    } catch {
      // Error captured by mutation state
    }
  };

  const handleEditFormClose = (open: boolean) => {
    if (!open) {
      setEditFormOpen(false);
      setEditingEntity(null);
    }
  };

  // ── Delete handlers ──
  const handleDelete = () => {
    if (!entity) return;
    setDeletingEntity(entity);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEntity) return;
    try {
      await deleteMutation.mutateAsync(deletingEntity.id);
      setDeleteDialogOpen(false);
      setDeletingEntity(null);
      onOpenChange(false);
      onChange?.();
    } catch {
      // Error captured by mutation state
    }
  };

  return (
    <>
      {entity && (
        <DetailSheet
          open={open}
          onOpenChange={onOpenChange}
          title={entity.name}
          size="md"
          pageHref={PAGE_ROUTES.ENTITY_DETAIL(entity.id)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        >
          <EntityContent entity={entity} />
        </DetailSheet>
      )}

      {/* Edit Form (child of this component) */}
      <EntityForm
        open={editFormOpen}
        onOpenChange={handleEditFormClose}
        initialData={editingEntity}
        onSubmit={handleEditFormSubmit}
        isLoading={updateMutation.isPending}
        mutationError={updateMutation.error?.message ?? null}
      />

      {/* Delete Confirmation (child of this component) */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={C.confirm.deleteTitle}
        description={L.deleteDescription(deletingEntity?.name ?? "")}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
