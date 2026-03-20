"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { COMMON_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import {
  useCreateFinding,
  useUpdateFinding,
  useDeleteFinding,
} from "../../hooks/useEngagements";
import { FindingFormSheet } from "./FindingFormSheet";
import type {
  EngagementDetail,
  EngagementProcedure,
  DraftFinding,
  FindingInput,
  FindingUpdateInput,
} from "../../types";

const C = COMMON_LABELS;
const LF = ENGAGEMENT_LABELS.finding;

const RISK_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

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
  const [deleteTarget, setDeleteTarget] = React.useState<DraftFinding | null>(
    null,
  );

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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {findings.length > 0 ? `${findings.length} phát hiện` : null}
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {LF.createTitle}
        </Button>
      </div>

      {/* Finding cards */}
      {findings.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {LF.noData}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {findings.map((f) => (
            <Card key={f.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {f.riskRating && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${RISK_COLORS[f.riskRating] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {LF.riskRating[f.riskRating] ?? f.riskRating}
                      </span>
                    )}
                    <Badge variant="secondary">
                      {LF.status[f.status] ?? f.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEdit(f)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(f)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {f.description && (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {f.description}
                  </p>
                )}
                {f.recommendation && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {LF.field.recommendation}:
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap">
                      {f.recommendation}
                    </p>
                  </div>
                )}
                {f.rootCause && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {LF.field.rootCause}:
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap">{f.rootCause}</p>
                  </div>
                )}
                {f.managementResponse && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {LF.field.managementResponse}:
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap">
                      {f.managementResponse}
                    </p>
                  </div>
                )}
                {f.linkedProcedures.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {LF.field.linkedProcedures}:{" "}
                    </span>
                    {f.linkedProcedures.map((p) => (
                      <Badge
                        key={p.id}
                        variant="outline"
                        className="mr-1 text-xs"
                      >
                        {p.title}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
