"use client";

import * as React from "react";
import { useEntityPageState } from "../hooks/useEntityPageState";
import { EntityList } from "./EntityList";
import { EntityForm } from "./EntityForm";
import { EntityDetail } from "./EntityDetail";
import { RiskRatingForm } from "./RiskRatingForm";
import { RiskAssessmentDetail } from "./RiskAssessmentDetail";
import { RiskHeatmap } from "./RiskHeatmap";
import { ResidualRiskChart } from "./ResidualRiskChart";
import { AuditCoverageChart } from "./AuditCoverageChart";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AddToPlanDialog } from "@/features/plan/components/AddToPlanDialog";
import { COMMON_LABELS, UNIVERSE_LABELS } from "@/constants/labels";
import type { AuditableEntity } from "../types";

const C = COMMON_LABELS;

const L = UNIVERSE_LABELS.entity;

export function EntityPageView() {
  const [addToPlanEntity, setAddToPlanEntity] =
    React.useState<AuditableEntity | null>(null);
  const [addToPlanOpen, setAddToPlanOpen] = React.useState(false);

  const handleAddToPlan = (entity: AuditableEntity) => {
    setAddToPlanEntity(entity);
    setAddToPlanOpen(true);
  };

  const {
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
    deleteEntity,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    handleSelect,
    handleCreate,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleRateRisk,
    handleViewRisk,
    handleFormSubmit,
    setDetailOpen,
    setFormOpen,
    setRiskFormOpen,
    setRaDetailOpen,
  } = useEntityPageState();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{L.title}</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý danh sách đối tượng kiểm toán trong tổ chức
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <RiskHeatmap />
        <ResidualRiskChart />
        <AuditCoverageChart />
      </div>

      <EntityList
        onSelect={handleSelect}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRateRisk={handleRateRisk}
        onViewRisk={handleViewRisk}
        onAddToPlan={handleAddToPlan}
      />

      {/* Detail sheet — edit + delete are self-contained */}
      <EntityDetail
        entity={selectedEntity}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Create / table-row-edit form */}
      <EntityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingEntity}
        onSubmit={handleFormSubmit}
        isLoading={isMutating}
        mutationError={mutationError}
      />

      {/* Risk rating dialog — from column button or auto after create */}
      <RiskRatingForm
        entity={riskEntity}
        open={riskFormOpen}
        onOpenChange={setRiskFormOpen}
      />

      {/* Risk assessment detail sheet — from badge click */}
      <RiskAssessmentDetail
        entity={raDetailEntity}
        open={raDetailOpen}
        onOpenChange={setRaDetailOpen}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={C.confirm.deleteTitle}
        description={deleteEntity ? L.deleteDescription(deleteEntity.name) : ""}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Add to plan dialog */}
      <AddToPlanDialog
        entity={addToPlanEntity}
        open={addToPlanOpen}
        onOpenChange={setAddToPlanOpen}
      />
    </div>
  );
}
