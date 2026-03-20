"use client";

import { Badge } from "@/components/ui/badge";
import {
  DetailSheet,
  DetailSection,
  DetailField,
} from "@/components/shared/DetailSheet";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import { PAGE_ROUTES } from "@/constants";
import type { OrgUnit } from "../types";

const L = SETTINGS_LABELS.orgUnit;
const C = COMMON_LABELS;

interface OrgUnitDetailProps {
  unit: OrgUnit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (unit: OrgUnit) => void;
  onDelete?: (unit: OrgUnit) => void;
}

export function OrgUnitDetail({
  unit,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: OrgUnitDetailProps) {
  if (!unit) return null;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={unit.name}
      size="md"
      pageHref={PAGE_ROUTES.ORG_UNIT_DETAIL(unit.id)}
      onEdit={onEdit ? () => onEdit(unit) : undefined}
      onDelete={onDelete ? () => onDelete(unit) : undefined}
    >
      {/* ── Basic Info ── */}
      <DetailSection title={L.section.basic} columns={2} hideDivider>
        <DetailField label={L.field.name}>{unit.name}</DetailField>
        <DetailField label={L.field.code}>{unit.code ?? "—"}</DetailField>
        <DetailField label={L.field.status}>
          <Badge variant={unit.status === "active" ? "default" : "secondary"}>
            {unit.status === "active" ? C.status.active : C.status.inactive}
          </Badge>
        </DetailField>
        <DetailField label={L.field.parent}>
          {unit.parentName ?? "—"}
        </DetailField>
        <DetailField label={L.field.description}>
          {unit.description ? (
            <span className="whitespace-pre-wrap">{unit.description}</span>
          ) : (
            "—"
          )}
        </DetailField>
      </DetailSection>

      {/* ── Leader ── */}
      <DetailSection title={L.section.leader} columns={2}>
        <DetailField label={L.leader.name}>
          {unit.leader?.name ?? "—"}
        </DetailField>
        <DetailField label={L.leader.position}>
          {unit.leader?.position ?? "—"}
        </DetailField>
        <DetailField label={L.leader.email}>
          {unit.leader?.email ?? "—"}
        </DetailField>
        <DetailField label={L.leader.phone}>
          {unit.leader?.phone ?? "—"}
        </DetailField>
      </DetailSection>

      {/* ── Contact Point ── */}
      <DetailSection title={L.section.contactPoint} columns={2}>
        <DetailField label={L.contactPoint.name}>
          {unit.contactPoint?.name ?? "—"}
        </DetailField>
        <DetailField label={L.contactPoint.position}>
          {unit.contactPoint?.position ?? "—"}
        </DetailField>
        <DetailField label={L.contactPoint.email}>
          {unit.contactPoint?.email ?? "—"}
        </DetailField>
        <DetailField label={L.contactPoint.phone}>
          {unit.contactPoint?.phone ?? "—"}
        </DetailField>
      </DetailSection>

      {/* ── Children ── */}
      {unit.children && unit.children.length > 0 && (
        <DetailSection title={`${L.field.children} (${unit.children.length})`}>
          <ul className="space-y-1">
            {unit.children.map((child) => (
              <li
                key={child.id}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
              >
                <span>{child.name}</span>
                <Badge
                  variant={child.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {child.status === "active"
                    ? C.status.active
                    : C.status.inactive}
                </Badge>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}
    </DetailSheet>
  );
}
