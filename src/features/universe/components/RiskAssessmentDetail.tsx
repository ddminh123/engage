"use client";

import { DetailSheet } from "@/components/shared/DetailSheet";
import { Badge } from "@/components/ui/badge";
import { UNIVERSE_LABELS } from "@/constants/labels";
import { PAGE_ROUTES } from "@/constants";
import { useRiskAssessments } from "../hooks/useEntities";
import { useEntityRisks } from "../hooks/useEntityRisks";
import { RiskAssessmentContent } from "./RiskAssessmentContent";
import { RISK_TYPE_LABELS } from "./RiskCatalogueForm";
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
  const { data: entityRisks = [] } = useEntityRisks(
    open ? (entity?.id ?? null) : null,
  );

  const ra = assessments[0] ?? null;

  const pageHref =
    entity && ra ? PAGE_ROUTES.ENTITY_RA_DETAIL(entity.id, ra.id) : undefined;

  const primaryRisks = entityRisks.filter((r) => r.isPrimary);
  const otherRisks = entityRisks.filter((r) => !r.isPrimary);

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`${L.section.risk} — ${entity?.name ?? ""}`}
      size="md"
      pageHref={pageHref}
    >
      {/* Entity Risks — Read-only */}
      <div className="rounded-lg border bg-muted/30 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide">
            Rủi ro của đối tượng
          </h3>
          {entityRisks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {entityRisks.length}
            </Badge>
          )}
        </div>
        {entityRisks.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Chưa có rủi ro nào được gán cho đối tượng này.
          </p>
        ) : (
          <div className="space-y-1.5">
            {primaryRisks.length > 0 && (
              <p className="text-[11px] font-medium text-muted-foreground mb-1">
                Rủi ro chính
              </p>
            )}
            {primaryRisks.map((risk) => (
              <div key={risk.id} className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-0.5">★</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{risk.name}</span>
                  {risk.code && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({risk.code})
                    </span>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1 shrink-0"
                >
                  {RISK_TYPE_LABELS[risk.riskType] ?? risk.riskType}
                </Badge>
              </div>
            ))}
            {otherRisks.length > 0 && primaryRisks.length > 0 && (
              <p className="text-[11px] font-medium text-muted-foreground mt-2 mb-1">
                Rủi ro khác
              </p>
            )}
            {otherRisks.map((risk) => (
              <div key={risk.id} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground/30 mt-0.5">★</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{risk.name}</span>
                  {risk.code && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({risk.code})
                    </span>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1 shrink-0"
                >
                  {RISK_TYPE_LABELS[risk.riskType] ?? risk.riskType}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Assessment */}
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
