"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DetailSheet,
  DetailSection,
  DetailField,
} from "@/components/shared/DetailSheet";
import { Badge } from "@/components/ui/badge";
import { COMMON_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import {
  useCreateFinding,
  useUpdateFinding,
  useDeleteFinding,
} from "../../hooks/useEngagements";
import { FindingFormSheet } from "./FindingFormSheet";
import { getFindingColumns } from "./findingColumns";
import type {
  EngagementDetail,
  EngagementProcedure,
  DraftFinding,
  FindingInput,
  FindingUpdateInput,
} from "../../types";

const C = COMMON_LABELS;
const LF = ENGAGEMENT_LABELS.finding;

interface FindingsTabProps {
  engagement: EngagementDetail;
}

export function FindingsTab({ engagement }: FindingsTabProps) {
  const engId = engagement.id;
  const { findings } = engagement;

  const createFinding = useCreateFinding();
  const updateFinding = useUpdateFinding();
  const deleteFinding = useDeleteFinding();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingFinding, setEditingFinding] =
    React.useState<DraftFinding | null>(null);
  const [viewFinding, setViewFinding] = React.useState<DraftFinding | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = React.useState<DraftFinding | null>(
    null,
  );

  // Keep local copy for detail sheet animation
  const [localView, setLocalView] = React.useState<DraftFinding | null>(null);
  React.useEffect(() => {
    if (viewFinding) setLocalView(viewFinding);
  }, [viewFinding]);

  // Collect all procedures for linking
  const allProcedures = React.useMemo(() => {
    const procs: EngagementProcedure[] = [...engagement.ungroupedProcedures];
    for (const s of engagement.sections) {
      procs.push(...s.procedures);
      for (const o of s.objectives) {
        procs.push(...o.procedures);
      }
    }
    return procs;
  }, [engagement]);

  const columns = React.useMemo(
    () => getFindingColumns((f) => setViewFinding(f)),
    [],
  );

  const handleAdd = () => {
    setEditingFinding(null);
    setFormOpen(true);
  };

  const handleEdit = (f: DraftFinding) => {
    setEditingFinding(f);
    setFormOpen(true);
  };

  const handleSubmit = (data: FindingInput | FindingUpdateInput) => {
    if (editingFinding) {
      updateFinding.mutate(
        {
          engagementId: engId,
          findingId: editingFinding.id,
          data: data as FindingUpdateInput,
        },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createFinding.mutate(
        { engagementId: engId, data: data as FindingInput },
        { onSuccess: () => setFormOpen(false) },
      );
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteFinding.mutate(
      { engagementId: engId, findingId: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) },
    );
  };

  const f = localView;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {LF.createTitle}
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={findings}
        emptyMessage={LF.noData}
        pageSize={20}
      />

      {/* Detail sheet */}
      <DetailSheet
        open={!!viewFinding}
        onOpenChange={(open) => {
          if (!open) setViewFinding(null);
        }}
        title={f?.title ?? ""}
        size="md"
        onEdit={() => {
          if (f) {
            setViewFinding(null);
            handleEdit(f);
          }
        }}
        onDelete={() => {
          if (f) {
            setViewFinding(null);
            setDeleteTarget(f);
          }
        }}
      >
        {f && (
          <>
            <DetailSection title="Thông tin chung" columns={2} hideDivider>
              <DetailField label={LF.field.description}>
                {f.description || "—"}
              </DetailField>
              <DetailField label={LF.field.riskRating}>
                {f.riskRating
                  ? (LF.riskRating[f.riskRating] ?? f.riskRating)
                  : "—"}
              </DetailField>
              <DetailField label={LF.field.status}>
                {LF.status[f.status] ?? f.status}
              </DetailField>
            </DetailSection>

            {(f.rootCause || f.recommendation || f.managementResponse) && (
              <DetailSection title="Chi tiết">
                <DetailField label={LF.field.rootCause}>
                  {f.rootCause || "—"}
                </DetailField>
                <DetailField label={LF.field.recommendation}>
                  {f.recommendation || "—"}
                </DetailField>
                <DetailField label={LF.field.managementResponse}>
                  {f.managementResponse || "—"}
                </DetailField>
              </DetailSection>
            )}

            {f.linkedProcedures.length > 0 && (
              <DetailSection title={LF.field.linkedProcedures}>
                <div className="flex flex-wrap gap-1">
                  {f.linkedProcedures.map((p) => (
                    <Badge key={p.id} variant="outline" className="text-xs">
                      {p.title}
                    </Badge>
                  ))}
                </div>
              </DetailSection>
            )}

            {(f.riskOwners.length > 0 || f.unitOwners.length > 0) && (
              <DetailSection title="Chủ sở hữu" columns={2}>
                {f.riskOwners.length > 0 && (
                  <DetailField label="Chủ rủi ro">
                    <div className="flex flex-wrap gap-1">
                      {f.riskOwners.map((o) => (
                        <Badge
                          key={o.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {o.name}
                        </Badge>
                      ))}
                    </div>
                  </DetailField>
                )}
                {f.unitOwners.length > 0 && (
                  <DetailField label="Đơn vị chịu trách nhiệm">
                    <div className="flex flex-wrap gap-1">
                      {f.unitOwners.map((o) => (
                        <Badge
                          key={o.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {o.name}
                        </Badge>
                      ))}
                    </div>
                  </DetailField>
                )}
              </DetailSection>
            )}
          </>
        )}
      </DetailSheet>

      {/* Finding form */}
      <FindingFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingFinding}
        allProcedures={allProcedures}
        onSubmit={handleSubmit}
        isLoading={createFinding.isPending || updateFinding.isPending}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={C.confirm.deleteTitle}
        description={
          deleteTarget ? LF.deleteDescription(deleteTarget.title) : ""
        }
        onConfirm={handleConfirmDelete}
        isLoading={deleteFinding.isPending}
      />
    </div>
  );
}
