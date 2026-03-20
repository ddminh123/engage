"use client";

import { DetailSheet } from "@/components/shared/DetailSheet";
import { UNIVERSE_LABELS } from "@/constants/labels";
import { PAGE_ROUTES } from "@/constants";
import { useRiskAssessments } from "../hooks/useEntities";
import { RiskAssessmentContent } from "./RiskAssessmentContent";
import type { AuditableEntity } from "../types";

const L = UNIVERSE_LABELS.entity;

interface RiskAssessmentDetailProps {
  entity: AuditableEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RiskAssessmentDetail({
  entity,
  open,
  onOpenChange,
}: RiskAssessmentDetailProps) {
  const { data: assessments = [] } = useRiskAssessments(
    open ? (entity?.id ?? null) : null,
  );

  const ra = assessments[0] ?? null;

  const pageHref =
    entity && ra ? PAGE_ROUTES.ENTITY_RA_DETAIL(entity.id, ra.id) : undefined;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`${L.section.risk} — ${entity?.name ?? ""}`}
      size="md"
      pageHref={pageHref}
    >
      {!ra ? (
        <p className="text-sm text-muted-foreground">
          Chưa có đánh giá rủi ro nào.
        </p>
      ) : (
        <RiskAssessmentContent ra={ra} />
      )}
    </DetailSheet>
  );
}
