"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import {
  DetailSheet,
  DetailSection,
  DetailField,
} from "@/components/shared/DetailSheet";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { COMMON_LABELS, PLAN_LABELS } from "@/constants/labels";
import {
  useRemovePlannedAudit,
  useUpdatePlannedAudit,
} from "../hooks/usePlans";
import { PlannedAuditForm } from "./PlannedAuditForm";
import type { PlannedAudit, PlannedAuditInput } from "../types";

const C = COMMON_LABELS;
const L = PLAN_LABELS.audit;

interface PlannedAuditDetailProps {
  audit: PlannedAudit | null;
  planId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange?: () => void;
}

export function PlannedAuditDetail({
  audit,
  planId,
  open,
  onOpenChange,
  onChange,
}: PlannedAuditDetailProps) {
  const router = useRouter();
  const [editFormOpen, setEditFormOpen] = React.useState(false);
  const [editingAudit, setEditingAudit] = React.useState<PlannedAudit | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingAudit, setDeletingAudit] = React.useState<PlannedAudit | null>(
    null,
  );

  const updateMutation = useUpdatePlannedAudit();
  const deleteMutation = useRemovePlannedAudit();

  const handleEdit = () => {
    if (!audit) return;
    setEditingAudit(audit);
    onOpenChange(false);
    setEditFormOpen(true);
  };

  const handleEditSubmit = async (data: PlannedAuditInput) => {
    if (!editingAudit) return;
    try {
      await updateMutation.mutateAsync({
        planId,
        auditId: editingAudit.id,
        data,
      });
      setEditFormOpen(false);
      setEditingAudit(null);
      onChange?.();
    } catch {
      // Error captured by mutation state
    }
  };

  const handleDelete = () => {
    if (!audit) return;
    setDeletingAudit(audit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAudit) return;
    try {
      await deleteMutation.mutateAsync({
        planId,
        auditId: deletingAudit.id,
      });
      setDeleteDialogOpen(false);
      setDeletingAudit(null);
      onOpenChange(false);
      onChange?.();
    } catch {
      // Error captured by mutation state
    }
  };

  if (!audit) return null;

  const title = audit.title || audit.entity?.name || "Kế hoạch cuộc kiểm toán";
  const statusLabel = L.status[audit.status] ?? audit.status;
  const priorityLabel = audit.priority
    ? (L.priority[audit.priority] ?? audit.priority)
    : null;
  const riskLevel = audit.entity?.riskLevel ?? audit.entity?.inherentRiskLevel;

  return (
    <>
      <DetailSheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        size="md"
        onEdit={handleEdit}
        onDelete={handleDelete}
      >
        {/* Status & Priority */}
        <DetailSection title="Thông tin chung" columns={2} hideDivider>
          <DetailField label={L.field.status}>
            <Badge
              variant={
                audit.status === "completed"
                  ? "default"
                  : audit.status === "in_progress"
                    ? "secondary"
                    : audit.status === "cancelled"
                      ? "destructive"
                      : "outline"
              }
            >
              {statusLabel}
            </Badge>
          </DetailField>
          <DetailField label={L.field.priority}>
            {priorityLabel ? (
              <Badge
                variant={
                  audit.priority === "high"
                    ? "destructive"
                    : audit.priority === "medium"
                      ? "secondary"
                      : "outline"
                }
              >
                {priorityLabel}
              </Badge>
            ) : (
              "—"
            )}
          </DetailField>
        </DetailSection>

        {/* Entity Info */}
        <DetailSection title={L.field.entity} columns={2}>
          <DetailField label="Tên đối tượng">
            {audit.entity?.name ?? "—"}
          </DetailField>
          <DetailField label="Loại">
            {audit.entity?.entityType?.name ?? "—"}
          </DetailField>
          <DetailField label={L.field.riskLevel}>
            {riskLevel ? <RiskLevelBadge level={riskLevel} /> : "—"}
          </DetailField>
        </DetailSection>

        {/* Schedule */}
        <DetailSection title="Lịch trình" columns={2}>
          <DetailField label={L.field.scheduledStart}>
            {new Date(audit.scheduledStart).toLocaleDateString("vi-VN")}
          </DetailField>
          <DetailField label={L.field.scheduledEnd}>
            {new Date(audit.scheduledEnd).toLocaleDateString("vi-VN")}
          </DetailField>
          <DetailField label={L.field.estimatedDays}>
            {audit.estimatedDays ? `${audit.estimatedDays} ngày` : "—"}
          </DetailField>
        </DetailSection>

        {/* Create Engagement */}
        <DetailSection title="Hành động" columns={1}>
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
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
              onOpenChange(false);
              router.push(`/engagement?create=1&${params.toString()}`);
            }}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            {L.createEngagement}
          </Button>
        </DetailSection>

        {/* Objective & Notes */}
        {(audit.objective || audit.notes) && (
          <DetailSection title="Chi tiết" columns={1}>
            {audit.objective && (
              <DetailField label={L.field.objective}>
                <span className="whitespace-pre-wrap">{audit.objective}</span>
              </DetailField>
            )}
            {audit.notes && (
              <DetailField label={L.field.notes}>
                <span className="whitespace-pre-wrap">{audit.notes}</span>
              </DetailField>
            )}
          </DetailSection>
        )}
      </DetailSheet>

      {/* Edit Form */}
      <PlannedAuditForm
        open={editFormOpen}
        onOpenChange={(o) => {
          setEditFormOpen(o);
          if (!o) setEditingAudit(null);
        }}
        initialData={editingAudit}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={C.confirm.deleteTitle}
        description={L.deleteDescription(
          deletingAudit?.title || deletingAudit?.entity?.name || "",
        )}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
