"use client";

import * as React from "react";
import {
  DetailSheet,
  DetailSection,
  DetailField,
} from "@/components/shared/DetailSheet";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import type { EngagementObjective } from "../../types";

const LO = ENGAGEMENT_LABELS.objective;
const LP = ENGAGEMENT_LABELS.procedure;

interface ObjectiveDetailSheetProps {
  objective: EngagementObjective | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ObjectiveDetailSheet({
  objective,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ObjectiveDetailSheetProps) {
  const [local, setLocal] = React.useState<EngagementObjective | null>(null);
  React.useEffect(() => {
    if (objective) setLocal(objective);
  }, [objective]);

  const o = local;
  if (!o) return null;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={o.title}
      size="md"
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <DetailSection title="Thông tin chung" columns={2} hideDivider>
        <DetailField label={LO.field.description}>
          {o.description || "—"}
        </DetailField>
        <DetailField label={LP.field.status}>
          {LP.status[o.status] ?? o.status}
        </DetailField>
      </DetailSection>

      <DetailSection title="Thủ tục" columns={1}>
        {o.procedures.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có thủ tục nào.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {o.procedures.map((p) => (
              <li key={p.id} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                <span>{p.title}</span>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>

      {(o.reviewNotes || o.reviewedBy) && (
        <DetailSection title="Soát xét" columns={2}>
          <DetailField label="Ghi chú soát xét">
            {o.reviewNotes || "—"}
          </DetailField>
          <DetailField label="Người soát xét">
            {o.reviewedBy || "—"}
          </DetailField>
          <DetailField label="Ngày soát xét">
            {o.reviewedAt
              ? new Date(o.reviewedAt).toLocaleDateString("vi-VN")
              : "—"}
          </DetailField>
        </DetailSection>
      )}
    </DetailSheet>
  );
}
