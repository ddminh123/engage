"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DetailSection, DetailField } from "@/components/shared/DetailSheet";
import { DetailPageLayout } from "@/components/shared/DetailPageLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { OrgUnitForm } from "@/features/settings/components/OrgUnitForm";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import {
  useOrgUnit,
  useUpdateOrgUnit,
  useDeleteOrgUnit,
} from "@/features/settings/hooks/useOrgUnits";
import type { OrgUnitUpdateInput } from "@/features/settings/types";

const C = COMMON_LABELS;
const L = SETTINGS_LABELS.orgUnit;

export default function OrgUnitDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: unit, isLoading } = useOrgUnit(id ?? null);
  const [editFormOpen, setEditFormOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const updateMutation = useUpdateOrgUnit();
  const deleteMutation = useDeleteOrgUnit();

  const handleEditSubmit = async (data: OrgUnitUpdateInput) => {
    try {
      await updateMutation.mutateAsync({ id: id!, data });
      setEditFormOpen(false);
    } catch {
      // Error captured by mutation state
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      router.push("/settings/org-chart");
    } catch {
      // Error captured by mutation state
    }
  };

  return (
    <>
      <DetailPageLayout
        title={unit?.name ?? (isLoading ? "…" : "Không tìm thấy")}
        backHref="/settings/org-chart"
        backLabel={L.title}
        onEdit={unit ? () => setEditFormOpen(true) : undefined}
        onDelete={unit ? () => setDeleteDialogOpen(true) : undefined}
        isLoading={isLoading}
      >
        {unit && (
          <>
            <DetailSection title={L.section.basic} columns={2} hideDivider>
              <DetailField label={L.field.name}>{unit.name}</DetailField>
              <DetailField label={L.field.code}>{unit.code ?? "—"}</DetailField>
              <DetailField label={L.field.status}>
                <Badge
                  variant={unit.status === "active" ? "default" : "secondary"}
                >
                  {unit.status === "active"
                    ? C.status.active
                    : C.status.inactive}
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

            {unit.children && unit.children.length > 0 && (
              <DetailSection
                title={`${L.field.children} (${unit.children.length})`}
              >
                <ul className="space-y-1">
                  {unit.children.map((child) => (
                    <li
                      key={child.id}
                      className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
                    >
                      <span>{child.name}</span>
                      <Badge
                        variant={
                          child.status === "active" ? "default" : "secondary"
                        }
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
          </>
        )}
      </DetailPageLayout>

      {unit && (
        <>
          <OrgUnitForm
            open={editFormOpen}
            onOpenChange={setEditFormOpen}
            initialData={unit}
            onSubmit={handleEditSubmit}
            isLoading={updateMutation.isPending}
            mutationError={updateMutation.error?.message ?? null}
          />
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title={C.confirm.deleteTitle}
            description={L.deleteDescription(unit.name)}
            onConfirm={handleConfirmDelete}
            isLoading={deleteMutation.isPending}
          />
        </>
      )}
    </>
  );
}
