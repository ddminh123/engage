"use client";

import * as React from "react";
import {
  DetailSheet,
  DetailSection,
  DetailField,
} from "@/components/shared/DetailSheet";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import type { EngagementSection } from "../../types";

const LS = ENGAGEMENT_LABELS.section;
const LP = ENGAGEMENT_LABELS.procedure;

interface SectionDetailSheetProps {
  section: EngagementSection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SectionDetailSheet({
  section,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: SectionDetailSheetProps) {
  const [local, setLocal] = React.useState<EngagementSection | null>(null);
  React.useEffect(() => {
    if (section) setLocal(section);
  }, [section]);

  const s = local;
  if (!s) return null;

  const totalProcedures =
    s.procedures.length +
    s.objectives.reduce((sum, o) => sum + o.procedures.length, 0);

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={s.title}
      size="md"
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <DetailSection title="Thông tin chung" columns={2} hideDivider>
        <DetailField label={LS.field.description}>
          {s.description || "—"}
        </DetailField>
        <DetailField label={LP.field.status}>
          {LP.status[s.status] ?? s.status}
        </DetailField>
      </DetailSection>

      <DetailSection title="Tổng quan" columns={2}>
        <DetailField label="Mục tiêu">
          {s.objectives.length}
        </DetailField>
        <DetailField label="Thủ tục">
          {totalProcedures}
        </DetailField>
      </DetailSection>

      {s.objectives.length > 0 && (
        <DetailSection title="Danh sách mục tiêu">
          <ul className="space-y-1 text-sm">
            {s.objectives.map((o) => (
              <li key={o.id} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{o.title}</span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {(s.reviewNotes || s.reviewedBy) && (
        <DetailSection title="Soát xét" columns={2}>
          <DetailField label="Ghi chú soát xét">
            {s.reviewNotes || "—"}
          </DetailField>
          <DetailField label="Người soát xét">
            {s.reviewedBy || "—"}
          </DetailField>
          <DetailField label="Ngày soát xét">
            {s.reviewedAt
              ? new Date(s.reviewedAt).toLocaleDateString("vi-VN")
              : "—"}
          </DetailField>
        </DetailSection>
      )}
    </DetailSheet>
  );
}
