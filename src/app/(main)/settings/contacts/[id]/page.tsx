"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DetailSection, DetailField } from "@/components/shared/DetailSheet";
import { DetailPageLayout } from "@/components/shared/DetailPageLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ContactForm } from "@/features/settings/components/ContactForm";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import {
  useContact,
  useUpdateContact,
  useDeleteContact,
} from "@/features/settings/hooks/useContacts";
import type { ContactInput } from "@/features/settings/types";

const C = COMMON_LABELS;
const LC = SETTINGS_LABELS.contact;

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: contact, isLoading } = useContact(id ?? null);
  const [editFormOpen, setEditFormOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();

  const handleEditSubmit = async (data: ContactInput) => {
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
      router.push("/settings/contacts");
    } catch {
      // Error captured by mutation state
    }
  };

  return (
    <>
      <DetailPageLayout
        title={contact?.name ?? (isLoading ? "…" : "Không tìm thấy")}
        backHref="/settings/contacts"
        backLabel="Danh bạ"
        onEdit={contact ? () => setEditFormOpen(true) : undefined}
        onDelete={contact ? () => setDeleteDialogOpen(true) : undefined}
        isLoading={isLoading}
      >
        {contact && (
          <DetailSection title="Thông tin liên hệ" columns={2} hideDivider>
            <DetailField label={C.field.name}>{contact.name}</DetailField>
            <DetailField label={C.field.position}>
              {contact.position ?? "—"}
            </DetailField>
            <DetailField label={C.field.email}>
              {contact.email ?? "—"}
            </DetailField>
            <DetailField label={C.field.phone}>
              {contact.phone ?? "—"}
            </DetailField>
            <DetailField label={LC.field.unit}>
              {contact.unitName ?? "—"}
            </DetailField>
            <DetailField label={C.field.status}>
              <Badge
                variant={contact.status === "active" ? "default" : "secondary"}
              >
                {contact.status === "active"
                  ? LC.status.active
                  : LC.status.inactive}
              </Badge>
            </DetailField>
          </DetailSection>
        )}
      </DetailPageLayout>

      {contact && (
        <>
          <ContactForm
            open={editFormOpen}
            onOpenChange={setEditFormOpen}
            initialData={contact}
            onSubmit={handleEditSubmit}
            isLoading={updateMutation.isPending}
            mutationError={updateMutation.error?.message ?? null}
          />
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title={C.confirm.deleteTitle}
            description={`Bạn có chắc chắn muốn xóa liên hệ "${contact.name}"? Hành động này không thể hoàn tác.`}
            onConfirm={handleConfirmDelete}
            isLoading={deleteMutation.isPending}
          />
        </>
      )}
    </>
  );
}
