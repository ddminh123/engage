"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { WorkpaperDocument } from "@/components/shared/workpaper/WorkpaperDocument";
import { FieldRow } from "@/components/shared/workpaper/WorkpaperFieldsTab";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { useUpdateEngagementRisk } from "../../hooks/useEngagements";
import type { EngagementRisk, EngagementRiskUpdateInput } from "../../types";
import type { JSONContent } from "@tiptap/react";

const LR = ENGAGEMENT_LABELS.risk;

const RATING_OPTIONS = Object.entries(LR.riskRating).map(([v, l]) => ({
  value: v,
  label: l,
}));

const CATEGORY_OPTIONS = Object.entries(LR.riskCategory).map(([v, l]) => ({
  value: v,
  label: l,
}));

const LIKELIHOOD_OPTIONS = Object.entries(LR.likelihood).map(([v, l]) => ({
  value: v,
  label: l,
}));

const IMPACT_OPTIONS = Object.entries(LR.impact).map(([v, l]) => ({
  value: v,
  label: l,
}));

interface RiskWorkpaperProps {
  risk: EngagementRisk;
  engagementId: string;
  onBack: () => void;
}

export function RiskWorkpaper({
  risk,
  engagementId,
  onBack,
}: RiskWorkpaperProps) {
  const updateRisk = useUpdateEngagementRisk();

  // Local field state (auto-save on change)
  const [riskRating, setRiskRating] = React.useState(risk.riskRating ?? "");
  const [riskCategory, setRiskCategory] = React.useState(risk.riskCategory ?? "");
  const [likelihood, setLikelihood] = React.useState(risk.likelihood ?? "");
  const [impact, setImpact] = React.useState(risk.impact ?? "");

  // Debounced field save
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveField = React.useCallback(
    (field: keyof EngagementRiskUpdateInput, value: string | null) => {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        updateRisk.mutate({
          engagementId,
          riskId: risk.id,
          data: { [field]: value || null },
        });
      }, 500);
    },
    [engagementId, risk.id, updateRisk],
  );

  const handleAutoSave = React.useCallback(
    async (content: JSONContent) => {
      updateRisk.mutate({
        engagementId,
        riskId: risk.id,
        data: { workpaperContent: content },
      });
    },
    [engagementId, risk.id, updateRisk],
  );

  const handleSave = React.useCallback(
    async (content: JSONContent) => {
      updateRisk.mutate({
        engagementId,
        riskId: risk.id,
        data: { workpaperContent: content },
      });
      onBack();
    },
    [engagementId, risk.id, updateRisk, onBack],
  );

  // Info tab
  const infoTab = React.useMemo(
    () => ({
      key: "info",
      label: "Thông tin",
      content: (
        <div className="space-y-4">
          <FieldRow label={LR.field.riskRating}>
            <LabeledSelect
              value={riskRating}
              onChange={(v) => {
                setRiskRating(v);
                saveField("riskRating", v);
              }}
              options={[{ value: "", label: "— Chọn —" }, ...RATING_OPTIONS]}
            />
          </FieldRow>

          <FieldRow label={LR.field.riskCategory}>
            <LabeledSelect
              value={riskCategory}
              onChange={(v) => {
                setRiskCategory(v);
                saveField("riskCategory", v);
              }}
              options={[{ value: "", label: "— Chọn —" }, ...CATEGORY_OPTIONS]}
            />
          </FieldRow>

          <FieldRow label={LR.field.likelihood}>
            <LabeledSelect
              value={likelihood}
              onChange={(v) => {
                setLikelihood(v);
                saveField("likelihood", v);
              }}
              options={[{ value: "", label: "— Chọn —" }, ...LIKELIHOOD_OPTIONS]}
            />
          </FieldRow>

          <FieldRow label={LR.field.impact}>
            <LabeledSelect
              value={impact}
              onChange={(v) => {
                setImpact(v);
                saveField("impact", v);
              }}
              options={[{ value: "", label: "— Chọn —" }, ...IMPACT_OPTIONS]}
            />
          </FieldRow>

          <Separator />

          <FieldRow label={LR.field.linkedControls}>
            {risk.controls.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {risk.controls.map((c) => (
                  <Badge key={c.id} variant="secondary" className="text-xs font-normal">
                    {c.description.length > 40
                      ? c.description.slice(0, 40) + "…"
                      : c.description}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Chưa liên kết kiểm soát nào.</p>
            )}
          </FieldRow>

          {risk.rcmObjective && (
            <FieldRow label={LR.field.auditObjective}>
              <p className="text-sm">{risk.rcmObjective.title}</p>
            </FieldRow>
          )}
        </div>
      ),
    }),
    [riskRating, riskCategory, likelihood, impact, risk.controls, risk.rcmObjective, saveField],
  );

  return (
    <WorkpaperDocument
      entityType="risk"
      entityId={risk.id}
      engagementId={engagementId}
      title={risk.riskDescription}
      content={risk.workpaperContent as JSONContent | null}
      onAutoSave={handleAutoSave}
      onSave={handleSave}
      onBack={onBack}
      isSaving={updateRisk.isPending}
      tabs={[infoTab]}
      defaultTab="info"
    />
  );
}
