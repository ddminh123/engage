"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTableColumnHeader } from "@/components/shared/DataTable";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { COMMON_LABELS, PLAN_LABELS } from "@/constants/labels";
import {
  usePlan,
  useUpdatePlan,
  useDeletePlan,
  useAddPlannedAudit,
  useRemovePlannedAudit,
  useUpdatePlannedAudit,
} from "../hooks/usePlans";
import { ScheduleChart } from "./ScheduleChart";
import { PlanForm } from "./PlanForm";
import { PlannedAuditForm } from "./PlannedAuditForm";
import { PlannedAuditDetail } from "./PlannedAuditDetail";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import type {
  AuditPlan,
  PlannedAudit,
  PlanInput,
  PlannedAuditInput,
} from "../types";
import type { ColumnDef } from "@tanstack/react-table";

const C = COMMON_LABELS;
const PL = PLAN_LABELS.plan;
const AL = PLAN_LABELS.audit;

const AUDIT_STATUS_OPTIONS = Object.entries(AL.status).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

function getPlannedAuditColumns(
  onStatusChange: (audit: PlannedAudit, status: string) => void,
): ColumnDef<PlannedAudit>[] {
  return [
    {
      id: "name",
      accessorFn: (row) => row.title || row.entity?.name || "—",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={AL.field.title} />
      ),
      cell: ({ row }) => {
        const audit = row.original;
        const name = audit.title || audit.entity?.name || "—";
        return <div className="font-medium">{name}</div>;
      },
      meta: { label: AL.field.title },
    },
    {
      id: "entity",
      accessorFn: (row) => row.entity?.name || "—",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={AL.field.entity} />
      ),
      cell: ({ row }) => {
        const entity = row.original.entity;
        if (!entity) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="leading-tight">
            <div>{entity.name}</div>
            {entity.entityType?.name && (
              <div className="text-xs text-muted-foreground">
                {entity.entityType.name}
              </div>
            )}
          </div>
        );
      },
      meta: { label: AL.field.entity },
    },
    {
      id: "riskLevel",
      accessorFn: (row) =>
        row.entity?.riskLevel ?? row.entity?.inherentRiskLevel,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={AL.field.riskLevel} />
      ),
      cell: ({ row }) => {
        const level =
          row.original.entity?.riskLevel ??
          row.original.entity?.inherentRiskLevel;
        if (!level) return <span className="text-muted-foreground">—</span>;
        return <RiskLevelBadge level={level} />;
      },
      meta: { label: AL.field.riskLevel },
    },
    {
      id: "schedule",
      accessorFn: (row) => row.scheduledStart,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={AL.field.schedule} />
      ),
      cell: ({ row }) => {
        const start = new Date(row.original.scheduledStart).toLocaleDateString(
          "vi-VN",
        );
        const end = new Date(row.original.scheduledEnd).toLocaleDateString(
          "vi-VN",
        );
        return (
          <span className="text-sm text-muted-foreground">
            {start} — {end}
          </span>
        );
      },
      meta: { label: AL.field.schedule },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={AL.field.priority} />
      ),
      cell: ({ row }) => {
        const p = row.getValue("priority") as string | null;
        if (!p) return <span className="text-muted-foreground">—</span>;
        const label = AL.priority[p] ?? p;
        const variant =
          p === "high"
            ? "destructive"
            : p === "medium"
              ? "secondary"
              : "outline";
        return <Badge variant={variant}>{label}</Badge>;
      },
      meta: { label: AL.field.priority },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={AL.field.status} />
      ),
      cell: ({ row }) => {
        const audit = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <LabeledSelect
              value={audit.status}
              onChange={(v) => onStatusChange(audit, v)}
              options={AUDIT_STATUS_OPTIONS}
            />
          </div>
        );
      },
      meta: { label: AL.field.status },
    },
    {
      accessorKey: "estimatedDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={AL.field.estimatedDays} />
      ),
      cell: ({ row }) => {
        const days = row.getValue("estimatedDays") as number | null;
        if (!days) return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm">{days} ngày</span>;
      },
      meta: { label: AL.field.estimatedDays },
    },
  ];
}

interface PlanDetailProps {
  planId: string;
  onBack: () => void;
}

export function PlanDetail({ planId, onBack }: PlanDetailProps) {
  const router = useRouter();
  const { data: plan, isLoading } = usePlan(planId);
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();
  const addAuditMutation = useAddPlannedAudit();
  const updateAuditMutation = useUpdatePlannedAudit();
  const removeAuditMutation = useRemovePlannedAudit();

  // Plan edit/delete state
  const [editFormOpen, setEditFormOpen] = React.useState(false);
  const [deletePlanDialogOpen, setDeletePlanDialogOpen] = React.useState(false);

  // Audit add/edit/delete state
  const [auditFormOpen, setAuditFormOpen] = React.useState(false);
  const [editingAudit, setEditingAudit] = React.useState<PlannedAudit | null>(
    null,
  );
  const [deleteAuditDialogOpen, setDeleteAuditDialogOpen] =
    React.useState(false);
  const [deletingAudit, setDeletingAudit] = React.useState<PlannedAudit | null>(
    null,
  );

  // Audit detail view state
  const [selectedAudit, setSelectedAudit] = React.useState<PlannedAudit | null>(
    null,
  );
  const [auditDetailOpen, setAuditDetailOpen] = React.useState(false);

  const handleSelectAudit = (audit: PlannedAudit) => {
    setSelectedAudit(audit);
    setAuditDetailOpen(true);
  };

  // Plan actions
  const handleEditPlan = (data: PlanInput) => {
    updatePlanMutation.mutate(
      { id: planId, data },
      { onSuccess: () => setEditFormOpen(false) },
    );
  };

  const handleDeletePlan = async () => {
    await deletePlanMutation.mutateAsync(planId);
    setDeletePlanDialogOpen(false);
    onBack();
  };

  const handleStatusChange = (newStatus: string) => {
    updatePlanMutation.mutate({ id: planId, data: { status: newStatus } });
  };

  // Audit actions
  const handleAuditStatusChange = (audit: PlannedAudit, status: string) => {
    updateAuditMutation.mutate({
      planId,
      auditId: audit.id,
      data: { status },
    });
  };

  const handleEditAudit = (audit: PlannedAudit) => {
    setEditingAudit(audit);
    setAuditFormOpen(true);
  };

  const handleDeleteAudit = (audit: PlannedAudit) => {
    setDeletingAudit(audit);
    setDeleteAuditDialogOpen(true);
  };

  const handleConfirmDeleteAudit = async () => {
    if (!deletingAudit) return;
    await removeAuditMutation.mutateAsync({
      planId,
      auditId: deletingAudit.id,
    });
    setDeleteAuditDialogOpen(false);
    setDeletingAudit(null);
  };

  const columns = React.useMemo(
    () => getPlannedAuditColumns(handleAuditStatusChange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [planId],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Không tìm thấy kế hoạch</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  const statusLabel = PL.status[plan.status] ?? plan.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{plan.title}</h1>
              <Badge
                variant={
                  plan.status === "approved"
                    ? "default"
                    : plan.status === "in_progress"
                      ? "secondary"
                      : plan.status === "closed"
                        ? "outline"
                        : "secondary"
                }
              >
                {statusLabel}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kỳ kế hoạch:{" "}
              {new Date(plan.periodStart).toLocaleDateString("vi-VN")} —{" "}
              {new Date(plan.periodEnd).toLocaleDateString("vi-VN")}
              {plan.description && ` · ${plan.description}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {plan.status === "draft" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditFormOpen(true)}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                {C.action.edit}
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange("approved")}
                disabled={updatePlanMutation.isPending}
              >
                Phê duyệt
              </Button>
            </>
          )}
          {plan.status === "approved" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("in_progress")}
              disabled={updatePlanMutation.isPending}
            >
              Bắt đầu thực hiện
            </Button>
          )}
          {plan.status === "in_progress" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("closed")}
              disabled={updatePlanMutation.isPending}
            >
              Đóng kế hoạch
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeletePlanDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Schedule Chart */}
      <ScheduleChart
        audits={plan.plannedAudits}
        periodStart={plan.periodStart}
        periodEnd={plan.periodEnd}
      />

      {/* Planned Audits Table */}
      <DataTable
        columns={columns}
        data={plan.plannedAudits}
        emptyMessage={AL.noData}
        onRowClick={handleSelectAudit}
        renderContextMenu={(audit) => (
          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleEditAudit(audit)}>
              <Pencil className="mr-2 h-4 w-4" />
              {C.action.edit}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                const params = new URLSearchParams({
                  plannedAuditId: audit.id,
                  entityId: audit.entityId,
                  title: audit.title || audit.entity?.name || "",
                  startDate: audit.scheduledStart.split("T")[0],
                  endDate: audit.scheduledEnd.split("T")[0],
                  ...(audit.priority ? { priority: audit.priority } : {}),
                  ...(audit.objective ? { objective: audit.objective } : {}),
                });
                router.push(`/engagement?create=1&${params.toString()}`);
              }}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              {AL.createEngagement}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => handleDeleteAudit(audit)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {C.action.delete}
            </ContextMenuItem>
          </ContextMenuContent>
        )}
        actions={
          <Button
            size="sm"
            className="h-8"
            onClick={() => {
              setEditingAudit(null);
              setAuditFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {AL.createTitle}
          </Button>
        }
      />

      {/* Plan Edit Form */}
      <PlanForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        initialData={plan}
        onSubmit={handleEditPlan}
        isLoading={updatePlanMutation.isPending}
      />

      {/* Planned Audit Add/Edit Form */}
      <PlannedAuditForm
        open={auditFormOpen}
        onOpenChange={(o) => {
          setAuditFormOpen(o);
          if (!o) setEditingAudit(null);
        }}
        initialData={editingAudit}
        onSubmit={(data) => {
          if (editingAudit) {
            updateAuditMutation.mutate(
              { planId, auditId: editingAudit.id, data },
              {
                onSuccess: () => {
                  setAuditFormOpen(false);
                  setEditingAudit(null);
                },
              },
            );
          } else {
            addAuditMutation.mutate(
              { planId, data },
              {
                onSuccess: () => {
                  setAuditFormOpen(false);
                },
              },
            );
          }
        }}
        isLoading={addAuditMutation.isPending || updateAuditMutation.isPending}
      />

      {/* Delete Plan Dialog */}
      <ConfirmDialog
        open={deletePlanDialogOpen}
        onOpenChange={setDeletePlanDialogOpen}
        title={C.confirm.deleteTitle}
        description={PL.deleteDescription(plan.title)}
        onConfirm={handleDeletePlan}
        isLoading={deletePlanMutation.isPending}
      />

      {/* Delete Audit Dialog */}
      <ConfirmDialog
        open={deleteAuditDialogOpen}
        onOpenChange={setDeleteAuditDialogOpen}
        title={C.confirm.deleteTitle}
        description={
          deletingAudit
            ? AL.deleteDescription(
                deletingAudit.title || deletingAudit.entity?.name || "",
              )
            : ""
        }
        onConfirm={handleConfirmDeleteAudit}
        isLoading={removeAuditMutation.isPending}
      />

      {/* Audit Detail Sheet */}
      <PlannedAuditDetail
        audit={selectedAudit}
        planId={planId}
        open={auditDetailOpen}
        onOpenChange={setAuditDetailOpen}
      />
    </div>
  );
}
