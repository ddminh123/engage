"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DetailSection, DetailField } from "@/components/shared/DetailSheet";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { ControlEffectivenessBadge } from "@/components/shared/ControlEffectivenessBadge";
import { UNIVERSE_LABELS } from "@/constants/labels";
import { PAGE_ROUTES } from "@/constants";
import { OrgUnitCardPopover } from "@/features/settings/components/OrgUnitCard";
import { useRiskAssessments } from "../hooks/useEntities";
import type { AuditableEntity, RiskAssessment } from "../types";

const L = UNIVERSE_LABELS.entity;

// ── Sub-components ──

function RiskAssessmentRow({
  ra,
  isLatest,
  entityId,
}: {
  ra: RiskAssessment;
  isLatest: boolean;
  entityId: string;
}) {
  return (
    <Link
      href={PAGE_ROUTES.ENTITY_RA_DETAIL(entityId, ra.id)}
      className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${
        isLatest
          ? "border-border bg-muted/40"
          : "border-border/50 bg-background"
      }`}
    >
      {/* PRIMARY: Residual risk level */}
      <div className="flex flex-col gap-0.5">
        <RiskLevelBadge
          level={ra.residualLevel}
          label={
            ra.residualLevel
              ? (L.riskLevel[ra.residualLevel as keyof typeof L.riskLevel] ??
                ra.residualLevel)
              : undefined
          }
        />
        <span className="text-[10px] text-muted-foreground leading-none">
          {L.field.residualRisk}
        </span>
      </div>

      {/* SUPPLEMENTAL: date, inherent, control, latest tag */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {new Date(ra.evaluationDate).toLocaleDateString("vi-VN")}
          </span>
          {isLatest && (
            <Badge variant="secondary" className="text-xs shrink-0 px-1.5 py-0">
              Mới nhất
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {ra.inherentLevel && (
            <RiskLevelBadge
              level={ra.inherentLevel}
              label={
                L.riskLevel[ra.inherentLevel as keyof typeof L.riskLevel] ??
                ra.inherentLevel
              }
              className="text-[10px] px-1.5 py-0 h-4"
            />
          )}
          {ra.controlEffectiveness && (
            <ControlEffectivenessBadge
              value={ra.controlEffectiveness}
              label={
                L.controlEffectiveness[
                  ra.controlEffectiveness as keyof typeof L.controlEffectiveness
                ] ?? ra.controlEffectiveness
              }
              className="text-[10px] px-1.5 py-0 h-4"
            />
          )}
        </div>
      </div>
    </Link>
  );
}

function RiskAssessmentList({ entityId }: { entityId: string }) {
  const { data: assessments = [], isLoading } = useRiskAssessments(entityId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {L.section.risk}
          {assessments.length > 0 && (
            <span className="ml-1.5 font-normal normal-case tracking-normal">
              ({assessments.length})
            </span>
          )}
        </p>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : assessments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có đánh giá rủi ro nào.
        </p>
      ) : (
        <div className="space-y-1.5">
          {assessments.map((ra, idx) => (
            <RiskAssessmentRow
              key={ra.id}
              ra={ra}
              isLatest={idx === 0}
              entityId={entityId}
            />
          ))}
        </div>
      )}
      <div className="border-b pt-1" />
    </div>
  );
}

// ── Main ──

interface EntityContentProps {
  entity: AuditableEntity;
}

export function EntityContent({ entity }: EntityContentProps) {
  return (
    <>
      {/* ── Basic Info ── */}
      <DetailSection title={L.section.basic} columns={2} hideDivider>
        <DetailField label={L.field.name}>{entity.name}</DetailField>
        <DetailField label={L.field.code}>{entity.code ?? "—"}</DetailField>
        <DetailField label={L.field.entityType}>
          {entity.entityType?.name ?? "—"}
        </DetailField>
        <DetailField label={L.field.area}>
          {entity.areas.length > 0
            ? entity.areas.map((a) => a.name).join(", ")
            : "—"}
        </DetailField>
        <DetailField label={L.field.auditCycle}>
          {entity.auditCycle
            ? (L.auditCycle[
                entity.auditCycle as keyof typeof L.auditCycle
              ] ?? entity.auditCycle)
            : "—"}
        </DetailField>
        <DetailField label={L.field.status}>
          <Badge
            variant={
              entity.status === "active"
                ? "default"
                : entity.status === "archived"
                  ? "outline"
                  : "secondary"
            }
          >
            {L.status[entity.status as keyof typeof L.status] ??
              entity.status}
          </Badge>
        </DetailField>
        <DetailField label={L.field.lastAuditedAt}>
          {entity.lastAuditedAt
            ? new Date(entity.lastAuditedAt).toLocaleDateString("vi-VN")
            : "—"}
        </DetailField>
        {entity.description && (
          <DetailField label={L.field.description}>
            <span className="whitespace-pre-wrap">
              {entity.description}
            </span>
          </DetailField>
        )}
      </DetailSection>

      {/* ── Units (owner + participating) ── */}
      <DetailSection title={L.section.units} columns={2}>
        <DetailField label={L.field.ownerUnit}>
          {entity.ownerUnits.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {entity.ownerUnits.map((u) => (
                <Badge
                  key={u.id}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  <OrgUnitCardPopover id={u.id}>
                    {u.name}
                  </OrgUnitCardPopover>
                </Badge>
              ))}
            </div>
          ) : (
            "—"
          )}
        </DetailField>
        <DetailField label={L.field.participatingUnits}>
          {entity.participatingUnits.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {entity.participatingUnits.map((u) => (
                <Badge
                  key={u.id}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  <OrgUnitCardPopover id={u.id}>
                    {u.name}
                  </OrgUnitCardPopover>
                </Badge>
              ))}
            </div>
          ) : (
            "—"
          )}
        </DetailField>
      </DetailSection>

      {/* ── Key Contacts ── */}
      <DetailSection title={L.section.contacts} columns={2}>
        <DetailField label={L.field.auditeeRep}>
          {entity.auditeeReps.length > 0 ? (
            <div className="flex flex-col gap-1">
              {entity.auditeeReps.map((c) => (
                <div key={c.id} className="leading-tight">
                  <div>{c.name}</div>
                  {c.position && (
                    <div className="text-xs text-muted-foreground">
                      {c.position}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            "—"
          )}
        </DetailField>
        <DetailField label={L.field.contactPoint}>
          {entity.contactPoints.length > 0 ? (
            <div className="flex flex-col gap-1">
              {entity.contactPoints.map((c) => (
                <div key={c.id} className="leading-tight">
                  <div>{c.name}</div>
                  {c.position && (
                    <div className="text-xs text-muted-foreground">
                      {c.position}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            "—"
          )}
        </DetailField>
        <DetailField label={L.field.auditSponsor}>
          {entity.auditSponsors.length > 0 ? (
            <div className="flex flex-col gap-1">
              {entity.auditSponsors.map((c) => (
                <div key={c.id} className="leading-tight">
                  <div>{c.name}</div>
                  {c.position && (
                    <div className="text-xs text-muted-foreground">
                      {c.position}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            "—"
          )}
        </DetailField>
      </DetailSection>

      {/* ── Đánh giá rủi ro (list) ── */}
      <RiskAssessmentList entityId={entity.id} />
    </>
  );
}
