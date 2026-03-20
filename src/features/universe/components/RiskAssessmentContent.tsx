"use client";

import { Badge } from "@/components/ui/badge";
import { DetailSection, DetailField } from "@/components/shared/DetailSheet";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { UNIVERSE_LABELS } from "@/constants/labels";
import { useRiskAssessmentFactors } from "../hooks/useRiskFactors";
import { useAssessmentSources } from "../hooks/useAssessmentSources";
import type { RiskAssessment } from "../types";
import { cn } from "@/lib/utils";

const L = UNIVERSE_LABELS.entity;

// ── Helpers ──

function scoreToLevel(score: number): "Low" | "Medium" | "High" | "Critical" {
  if (score <= 4) return "Low";
  if (score <= 9) return "Medium";
  if (score <= 16) return "High";
  return "Critical";
}

const LEVEL_DOT: Record<string, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  Critical: "bg-red-600",
};

const CONTROL_DOT: Record<string, string> = {
  Strong: "bg-emerald-500",
  Medium: "bg-amber-500",
  Weak: "bg-red-600",
};

function chipClasses(isPositive?: boolean) {
  if (isPositive === true)
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300";
  if (isPositive === false)
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300";
  return "";
}

// ── Sub-components ──

function ScoreLevelDisplay({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const level = scoreToLevel(score);
  const label = L.riskLevel[level as keyof typeof L.riskLevel] ?? level;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-block size-2.5 shrink-0 rounded-full",
          LEVEL_DOT[level] ?? "",
        )}
      />
      <span className="font-semibold">
        {score} - {label}
      </span>
    </span>
  );
}

function FactorChips({ ids, label }: { ids: string[]; label: string }) {
  const { data: allFactors = [] } = useRiskAssessmentFactors();
  if (!ids || ids.length === 0) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {ids.map((id) => {
          const factor = allFactors.find((f) => f.id === id);
          return (
            <Badge
              key={id}
              variant="outline"
              className={cn("text-xs", chipClasses(factor?.isPositive))}
            >
              {factor?.name ?? id}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

function SourceName({ id }: { id: string | null }) {
  const { data: sources = [] } = useAssessmentSources();
  if (!id) return <span>—</span>;
  const source = sources.find((s) => s.id === id);
  return <span>{source?.name ?? id}</span>;
}

// ── Main ──

interface RiskAssessmentContentProps {
  ra: RiskAssessment;
}

export function RiskAssessmentContent({ ra }: RiskAssessmentContentProps) {
  return (
    <>
      {/* ══ Section 1: Rủi ro còn lại (PROMINENT) ══ */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
          {L.section.residualRisk}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Mức rủi ro còn lại
          </span>
          <span className="text-lg">
            {ra.residualScore != null ? (
              <ScoreLevelDisplay
                score={ra.residualScore}
                className="text-base"
              />
            ) : ra.residualLevel ? (
              <RiskLevelBadge
                level={ra.residualLevel}
                label={
                  L.riskLevel[ra.residualLevel as keyof typeof L.riskLevel] ??
                  ra.residualLevel
                }
              />
            ) : (
              "—"
            )}
          </span>
        </div>
        {ra.conclusion && (
          <div className="mt-3 pt-3 border-t border-primary/10">
            <p className="text-xs text-muted-foreground mb-1">Kết luận</p>
            <p className="text-sm whitespace-pre-wrap">{ra.conclusion}</p>
          </div>
        )}
      </div>

      {/* ══ Section 2: Rủi ro tiềm tàng ══ */}
      <DetailSection title={L.section.inherentRisk} hideDivider>
        {/* Impact */}
        {ra.inherentImpact != null && (
          <DetailField label={L.field.inherentImpact}>
            <span className="font-semibold">{ra.inherentImpact}</span>
          </DetailField>
        )}
        <FactorChips ids={ra.riskFactors.impact} label="Yếu tố ảnh hưởng" />
        {ra.impactRationale && (
          <DetailField label="Lý do đánh giá tác động">
            <span className="whitespace-pre-wrap text-muted-foreground">
              {ra.impactRationale}
            </span>
          </DetailField>
        )}

        {/* Likelihood */}
        {ra.inherentLikelihood != null && (
          <DetailField label={L.field.inherentLikelihood}>
            <span className="font-semibold">{ra.inherentLikelihood}</span>
          </DetailField>
        )}
        <FactorChips ids={ra.riskFactors.likelihood} label="Yếu tố ảnh hưởng" />
        {ra.likelihoodRationale && (
          <DetailField label="Lý do đánh giá khả năng">
            <span className="whitespace-pre-wrap text-muted-foreground">
              {ra.likelihoodRationale}
            </span>
          </DetailField>
        )}

        {/* Inherent score summary - less prominent */}
        <div className="rounded-md border border-muted bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {L.field.inherentScore}
            </span>
            <ScoreLevelDisplay score={ra.inherentScore} />
          </div>
        </div>
      </DetailSection>

      {/* ══ Section 3: Môi trường kiểm soát ══ */}
      <DetailSection title={L.section.controlEffectiveness}>
        <DetailField label={L.field.controlEffectiveness}>
          {ra.controlEffectiveness ? (
            <span className="inline-flex items-center gap-2">
              <span
                className={cn(
                  "inline-block size-2.5 shrink-0 rounded-full",
                  CONTROL_DOT[ra.controlEffectiveness] ?? "",
                )}
              />
              {L.controlEffectiveness[
                ra.controlEffectiveness as keyof typeof L.controlEffectiveness
              ] ?? ra.controlEffectiveness}
            </span>
          ) : (
            "—"
          )}
        </DetailField>
        <FactorChips ids={ra.riskFactors.control} label="Yếu tố kiểm soát" />
        {ra.controlRationale && (
          <DetailField label="Lý do đánh giá kiểm soát">
            <span className="whitespace-pre-wrap text-muted-foreground">
              {ra.controlRationale}
            </span>
          </DetailField>
        )}
      </DetailSection>

      {/* ══ Section 4: Thông tin đánh giá ══ */}
      <DetailSection title={L.section.assessmentContext}>
        {ra.note && (
          <DetailField label="Đánh giá chi tiết">
            <span className="whitespace-pre-wrap">{ra.note}</span>
          </DetailField>
        )}
        <DetailField label={L.field.assessmentSource}>
          <SourceName id={ra.assessmentSourceId} />
        </DetailField>
        <DetailField label="Yêu cầu của ban lãnh đạo">
          {ra.managementRequest ? "Có" : "Không"}
        </DetailField>
      </DetailSection>

      {/* ══ Section 5: Thông tin xử lý ══ */}
      <DetailSection title={L.section.assessmentMetadata} columns={2}>
        <DetailField label={L.field.evaluationDate}>
          {new Date(ra.evaluationDate).toLocaleDateString("vi-VN")}
        </DetailField>
        <DetailField label={L.field.evaluatedBy}>
          {ra.evaluatedBy ?? "—"}
        </DetailField>
        <DetailField label={L.field.approvedBy}>
          {ra.approvedBy ?? "—"}
        </DetailField>
      </DetailSection>
    </>
  );
}
