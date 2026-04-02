"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { WorkpaperDocument } from "@/components/shared/workpaper/WorkpaperDocument";
import { FieldRow } from "@/components/shared/workpaper/WorkpaperFieldsTab";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { useUpdateEngagementControl } from "../../hooks/useEngagements";
import type { EngagementControl, EngagementControlUpdateInput, EngagementRisk } from "../../types";
import type { JSONContent } from "@tiptap/react";

const LR = ENGAGEMENT_LABELS.risk;

const EFFECTIVENESS_OPTIONS = Object.entries(LR.controlEffectiveness).map(([v, l]) => ({
  value: v,
  label: l,
}));

const TYPE_OPTIONS = Object.entries(LR.controlType).map(([v, l]) => ({
  value: v,
  label: l,
}));

const NATURE_OPTIONS = Object.entries(LR.controlNature).map(([v, l]) => ({
  value: v,
  label: l,
}));

const FREQUENCY_OPTIONS = Object.entries(LR.controlFrequency).map(([v, l]) => ({
  value: v,
  label: l,
}));

interface ControlWorkpaperProps {
  control: EngagementControl;
  engagementId: string;
  /** Linked risks for display in sidebar */
  linkedRisks?: EngagementRisk[];
  onBack: () => void;
}

export function ControlWorkpaper({
  control,
  engagementId,
  linkedRisks = [],
  onBack,
}: ControlWorkpaperProps) {
  const updateControl = useUpdateEngagementControl();

  const [effectiveness, setEffectiveness] = React.useState(control.effectiveness ?? "");
  const [controlType, setControlType] = React.useState(control.controlType ?? "");
  const [controlNature, setControlNature] = React.useState(control.controlNature ?? "");
  const [frequency, setFrequency] = React.useState(control.frequency ?? "");

  // Debounced field save
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveField = React.useCallback(
    (field: keyof EngagementControlUpdateInput, value: string | null) => {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        updateControl.mutate({
          engagementId,
          controlId: control.id,
          data: { [field]: value || null },
        });
      }, 500);
    },
    [engagementId, control.id, updateControl],
  );

  const handleAutoSave = React.useCallback(
    async (content: JSONContent) => {
      updateControl.mutate({
        engagementId,
        controlId: control.id,
        data: { workpaperContent: content },
      });
    },
    [engagementId, control.id, updateControl],
  );

  const handleSave = React.useCallback(
    async (content: JSONContent) => {
      updateControl.mutate({
        engagementId,
        controlId: control.id,
        data: { workpaperContent: content },
      });
      onBack();
    },
    [engagementId, control.id, updateControl, onBack],
  );

  const infoTab = React.useMemo(
    () => ({
      key: "info",
      label: "Thông tin",
      content: (
        <div className="space-y-4">
          <FieldRow label={LR.field.controlEffectiveness}>
            <LabeledSelect
              value={effectiveness}
              onChange={(v) => {
                setEffectiveness(v);
                saveField("effectiveness", v);
              }}
              options={[{ value: "", label: "— Chọn —" }, ...EFFECTIVENESS_OPTIONS]}
            />
          </FieldRow>

          <FieldRow label={LR.field.controlType}>
            <LabeledSelect
              value={controlType}
              onChange={(v) => {
                setControlType(v);
                saveField("controlType", v);
              }}
              options={[{ value: "", label: "— Chọn —" }, ...TYPE_OPTIONS]}
            />
          </FieldRow>

          <FieldRow label={LR.field.controlNature}>
            <LabeledSelect
              value={controlNature}
              onChange={(v) => {
                setControlNature(v);
                saveField("controlNature", v);
              }}
              options={[{ value: "", label: "— Chọn —" }, ...NATURE_OPTIONS]}
            />
          </FieldRow>

          <FieldRow label={LR.field.controlFrequency}>
            <LabeledSelect
              value={frequency}
              onChange={(v) => {
                setFrequency(v);
                saveField("frequency", v);
              }}
              options={[{ value: "", label: "— Chọn —" }, ...FREQUENCY_OPTIONS]}
            />
          </FieldRow>

          <Separator />

          <FieldRow label={LR.field.linkedRisks}>
            {linkedRisks.length > 0 ? (
              <div className="space-y-1">
                {linkedRisks.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">
                      {r.riskDescription.length > 60
                        ? r.riskDescription.slice(0, 60) + "…"
                        : r.riskDescription}
                    </span>
                    {r.riskRating && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {LR.riskRating[r.riskRating] ?? r.riskRating}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Chưa liên kết rủi ro nào.</p>
            )}
          </FieldRow>
        </div>
      ),
    }),
    [effectiveness, controlType, controlNature, frequency, linkedRisks, saveField],
  );

  return (
    <WorkpaperDocument
      entityType="control"
      entityId={control.id}
      engagementId={engagementId}
      title={control.description}
      content={control.workpaperContent as JSONContent | null}
      onAutoSave={handleAutoSave}
      onSave={handleSave}
      onBack={onBack}
      isSaving={updateControl.isPending}
      tabs={[infoTab]}
      defaultTab="info"
    />
  );
}
