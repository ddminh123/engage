"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { DetailPageLayout } from "@/components/shared/DetailPageLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EntityForm } from "@/features/universe/components/EntityForm";
import { EntityContent } from "@/features/universe/components/EntityContent";
import { RiskRatingForm } from "@/features/universe/components/RiskRatingForm";
import { COMMON_LABELS, UNIVERSE_LABELS } from "@/constants/labels";
import { PAGE_ROUTES } from "@/constants";
import {
  useEntity,
  useUpdateEntity,
  useDeleteEntity,
} from "@/features/universe/hooks/useEntities";
import type { EntityInput } from "@/features/universe/types";

const C = COMMON_LABELS;
const L = UNIVERSE_LABELS.entity;

export default function EntityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: entity, isLoading } = useEntity(id ?? null);

  const [editFormOpen, setEditFormOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [riskFormOpen, setRiskFormOpen] = React.useState(false);

  const updateMutation = useUpdateEntity();
  const deleteMutation = useDeleteEntity();

  const handleEditSubmit = async (data: EntityInput) => {
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
      router.push(PAGE_ROUTES.UNIVERSE);
    } catch {
      // Error captured by mutation state
    }
  };

  return (
    <>
      <DetailPageLayout
        title={entity?.name ?? (isLoading ? "…" : "Không tìm thấy")}
        backHref={PAGE_ROUTES.UNIVERSE}
        backLabel={L.title}
        onEdit={entity ? () => setEditFormOpen(true) : undefined}
        onDelete={entity ? () => setDeleteDialogOpen(true) : undefined}
        isLoading={isLoading}
      >
        {entity && <EntityContent entity={entity} />}
      </DetailPageLayout>

      {entity && (
        <>
          <EntityForm
            open={editFormOpen}
            onOpenChange={setEditFormOpen}
            initialData={entity}
            onSubmit={handleEditSubmit}
            isLoading={updateMutation.isPending}
            mutationError={updateMutation.error?.message ?? null}
          />
          <RiskRatingForm
            entity={entity}
            open={riskFormOpen}
            onOpenChange={setRiskFormOpen}
          />
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title={C.confirm.deleteTitle}
            description={L.deleteDescription(entity.name)}
            onConfirm={handleConfirmDelete}
            isLoading={deleteMutation.isPending}
          />
        </>
      )}
    </>
  );
}
