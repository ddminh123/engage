"use client";

import { useContactPageState } from "../hooks/useContactPageState";
import { ContactList } from "./ContactList";
import { ContactForm } from "./ContactForm";
import { ContactDetail } from "./ContactDetail";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { COMMON_LABELS } from "@/constants/labels";

const C = COMMON_LABELS;

export function ContactPageView() {
  const {
    selectedContact,
    detailOpen,
    formOpen,
    editingContact,
    deleteDialogOpen,
    contactToDelete,
    isMutating,
    isDeleting,
    mutationError,
    handleSelect,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleConfirmDelete,
    setDetailOpen,
    setFormOpen,
    setDeleteDialogOpen,
  } = useContactPageState();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Danh bạ</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý danh sách liên hệ trong tổ chức
        </p>
      </div>

      <ContactList
        onSelect={handleSelect}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <ContactDetail
        contact={selectedContact}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingContact}
        onSubmit={handleFormSubmit}
        isLoading={isMutating}
        mutationError={mutationError}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={C.confirm.deleteTitle}
        description={`Bạn có chắc chắn muốn xóa liên hệ "${contactToDelete?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
