"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DetailSheet,
  DetailSection,
  DetailField,
} from "@/components/shared/DetailSheet";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { ProcedureFormSheet } from "./ProcedureFormSheet";
import { FindingFormSheet } from "./FindingFormSheet";
import {
  useUpdateProcedure,
  useDeleteProcedure,
  useCreateFinding,
} from "../../hooks/useEngagements";
import type {
  EngagementProcedure,
  ProcedureUpdateInput,
  FindingInput,
} from "../../types";

const LP = ENGAGEMENT_LABELS.procedure;

interface ProcedureDetailSheetProps {
  procedure: EngagementProcedure | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
}

export function ProcedureDetailSheet({
  procedure,
  open,
  onOpenChange,
  engagementId,
}: ProcedureDetailSheetProps) {
  const [editing, setEditing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [addingFinding, setAddingFinding] = React.useState(false);
  // Keep a local copy so closing the sheet doesn't lose data mid-animation
  const [local, setLocal] = React.useState<EngagementProcedure | null>(null);
  React.useEffect(() => {
    if (procedure) setLocal(procedure);
  }, [procedure]);

  const p = local;

  const updateProc = useUpdateProcedure();
  const deleteProc = useDeleteProcedure();
  const createFinding = useCreateFinding();

  const handleUpdate = (data: ProcedureUpdateInput) => {
    if (!p) return;
    updateProc.mutate(
      { engagementId, procedureId: p.id, data },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleDelete = () => {
    if (!p) return;
    deleteProc.mutate(
      { engagementId, procedureId: p.id },
      {
        onSuccess: () => {
          setDeleting(false);
          onOpenChange(false);
        },
      },
    );
  };

  if (!p) return null;

  return (
    <>
      <DetailSheet
        open={open}
        onOpenChange={onOpenChange}
        title={p.title}
        size="md"
        onEdit={() => setEditing(true)}
        onDelete={() => setDeleting(true)}
      >
        <DetailSection title="Thông tin chung" columns={2} hideDivider>
          <DetailField label={LP.field.description}>
            {p.description || "—"}
          </DetailField>
          <DetailField label={LP.field.procedureType}>
            {p.procedureType
              ? (LP.procedureType[p.procedureType] ?? p.procedureType)
              : "—"}
          </DetailField>
          <DetailField label="Phân loại">
            {p.procedureCategory
              ? (LP.procedureCategory[p.procedureCategory] ??
                p.procedureCategory)
              : "—"}
          </DetailField>
          <DetailField label={LP.field.status}>
            {LP.status[p.status] ?? p.status}
          </DetailField>
          <DetailField label={LP.field.priority}>
            {p.priority
              ? (ENGAGEMENT_LABELS.engagement.priority[p.priority] ??
                p.priority)
              : "—"}
          </DetailField>
        </DetailSection>

        {/* References */}
        {(p.linkedObjectives.length > 0 ||
          p.linkedRisks.length > 0 ||
          p.linkedControls.length > 0) && (
          <DetailSection title="Tham chiếu">
            {p.linkedObjectives.length > 0 && (
              <DetailField label="Mục tiêu RCM">
                <div className="flex flex-wrap gap-1">
                  {p.linkedObjectives.map((o) => (
                    <Badge key={o.id} variant="secondary" className="text-xs">
                      {o.title}
                    </Badge>
                  ))}
                </div>
              </DetailField>
            )}
            {p.linkedRisks.length > 0 && (
              <DetailField label="Rủi ro">
                <div className="flex flex-wrap gap-1">
                  {p.linkedRisks.map((r) => (
                    <Badge key={r.id} variant="secondary" className="text-xs">
                      {r.riskDescription}
                    </Badge>
                  ))}
                </div>
              </DetailField>
            )}
            {p.linkedControls.length > 0 && (
              <DetailField label="Kiểm soát">
                <div className="flex flex-wrap gap-1">
                  {p.linkedControls.map((c) => (
                    <Badge key={c.id} variant="secondary" className="text-xs">
                      {c.description}
                    </Badge>
                  ))}
                </div>
              </DetailField>
            )}
          </DetailSection>
        )}

        {/* Execution details */}
        {(p.observations || p.conclusion || p.sampleSize != null) && (
          <DetailSection title="Thực hiện" columns={2}>
            <DetailField label={LP.field.observations}>
              {p.observations || "—"}
            </DetailField>
            <DetailField label={LP.field.conclusion}>
              {p.conclusion || "—"}
            </DetailField>
            <DetailField label={LP.field.sampleSize}>
              {p.sampleSize != null ? String(p.sampleSize) : "—"}
            </DetailField>
            <DetailField label={LP.field.exceptions}>
              {p.exceptions != null ? String(p.exceptions) : "—"}
            </DetailField>
          </DetailSection>
        )}

        {/* Review */}
        {(p.reviewNotes || p.reviewedBy) && (
          <DetailSection title="Soát xét" columns={2}>
            <DetailField label={LP.field.reviewNotes}>
              {p.reviewNotes || "—"}
            </DetailField>
            <DetailField label={LP.field.reviewedBy}>
              {p.reviewedBy || "—"}
            </DetailField>
            <DetailField label={LP.field.reviewedAt}>
              {p.reviewedAt
                ? new Date(p.reviewedAt).toLocaleDateString("vi-VN")
                : "—"}
            </DetailField>
          </DetailSection>
        )}

        {/* Linked findings + add button */}
        <DetailSection title="Phát hiện liên quan">
          {p.linkedFindings.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {p.linkedFindings.map((f) => (
                <Badge key={f.id} variant="outline" className="text-xs">
                  {f.title}
                </Badge>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setAddingFinding(true)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Thêm phát hiện
          </Button>
        </DetailSection>
      </DetailSheet>

      <ProcedureFormSheet
        open={editing}
        onOpenChange={setEditing}
        initialData={p}
        onSubmit={handleUpdate}
        isLoading={updateProc.isPending}
      />

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={LP.deleteTitle}
        description={LP.deleteDescription(p.title)}
        onConfirm={handleDelete}
        isLoading={deleteProc.isPending}
      />

      <FindingFormSheet
        open={addingFinding}
        onOpenChange={setAddingFinding}
        allProcedures={[p]}
        initialData={{
          id: "",
          engagementId,
          title: "",
          description: null,
          riskRating: null,
          status: "draft",
          recommendation: null,
          managementResponse: null,
          rootCause: null,
          createdBy: null,
          createdAt: "",
          updatedAt: "",
          linkedProcedures: [{ id: p.id, title: p.title }],
          riskOwners: [],
          unitOwners: [],
        }}
        onSubmit={(data) => {
          createFinding.mutate(
            { engagementId, data: data as FindingInput },
            { onSuccess: () => setAddingFinding(false) },
          );
        }}
        isLoading={createFinding.isPending}
      />
    </>
  );
}
