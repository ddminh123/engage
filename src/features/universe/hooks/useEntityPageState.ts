import * as React from "react";
import { useCreateEntity, useUpdateEntity, useDeleteEntity } from "./useEntities";
import type { AuditableEntity, EntityInput } from "../types";

export function useEntityPageState() {
  const [selectedEntity, setSelectedEntity] = React.useState<AuditableEntity | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingEntity, setEditingEntity] = React.useState<AuditableEntity | null>(null);

  // Risk rating form
  const [riskEntity, setRiskEntity] = React.useState<AuditableEntity | null>(null);
  const [riskFormOpen, setRiskFormOpen] = React.useState(false);

  // Risk assessment detail sheet
  const [raDetailEntity, setRaDetailEntity] = React.useState<AuditableEntity | null>(null);
  const [raDetailOpen, setRaDetailOpen] = React.useState(false);

  // Delete confirmation
  const [deleteEntity, setDeleteEntity] = React.useState<AuditableEntity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const createMutation = useCreateEntity();
  const updateMutation = useUpdateEntity();
  const deleteMutation = useDeleteEntity();

  const handleSelect = (entity: AuditableEntity) => {
    setSelectedEntity(entity);
    setDetailOpen(true);
  };

  const handleCreate = () => {
    setEditingEntity(null);
    setFormOpen(true);
  };

  const handleEdit = (entity: AuditableEntity) => {
    setEditingEntity(entity);
    setFormOpen(true);
  };

  const handleRateRisk = React.useCallback((entity: AuditableEntity) => {
    setRiskEntity(entity);
    setRiskFormOpen(true);
  }, []);

  const handleViewRisk = React.useCallback((entity: AuditableEntity) => {
    setRaDetailEntity(entity);
    setRaDetailOpen(true);
  }, []);

  const handleDelete = React.useCallback((entity: AuditableEntity) => {
    setDeleteEntity(entity);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteEntity) return;
    try {
      await deleteMutation.mutateAsync(deleteEntity.id);
      setDeleteDialogOpen(false);
      setDeleteEntity(null);
    } catch {
      // Error captured by mutation state
    }
  };

  const handleFormSubmit = async (data: EntityInput) => {
    try {
      if (editingEntity) {
        await updateMutation.mutateAsync({ id: editingEntity.id, data });
        setFormOpen(false);
        setEditingEntity(null);
      } else {
        const created = await createMutation.mutateAsync(data);
        setFormOpen(false);
        setEditingEntity(null);
        // Auto-open risk rating form for the newly created entity
        setRiskEntity(created);
        setRiskFormOpen(true);
      }
    } catch {
      // Error captured by mutation state
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const mutationError =
    createMutation.error?.message ?? updateMutation.error?.message ?? null;

  return {
    selectedEntity,
    detailOpen,
    formOpen,
    editingEntity,
    isMutating,
    mutationError,
    riskEntity,
    riskFormOpen,
    raDetailEntity,
    raDetailOpen,
    handleSelect,
    handleCreate,
    handleEdit,
    handleRateRisk,
    handleViewRisk,
    handleDelete,
    handleConfirmDelete,
    handleFormSubmit,
    setDetailOpen,
    setFormOpen,
    setRiskFormOpen,
    setRaDetailOpen,
    deleteEntity,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting: deleteMutation.isPending,
  };
}
