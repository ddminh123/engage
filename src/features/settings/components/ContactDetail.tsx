"use client";

import { Badge } from "@/components/ui/badge";
import {
  DetailSheet,
  DetailSection,
  DetailField,
} from "@/components/shared/DetailSheet";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import { PAGE_ROUTES } from "@/constants";
import type { Contact } from "../types";

const C = COMMON_LABELS;
const LC = SETTINGS_LABELS.contact;

interface ContactDetailProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export function ContactDetail({
  contact,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ContactDetailProps) {
  if (!contact) return null;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={contact.name}
      size="md"
      pageHref={PAGE_ROUTES.CONTACT_DETAIL(contact.id)}
      onEdit={onEdit ? () => onEdit(contact) : undefined}
      onDelete={onDelete ? () => onDelete(contact) : undefined}
    >
      <DetailSection title="Thông tin liên hệ" columns={2} hideDivider>
        <DetailField label={C.field.name}>{contact.name}</DetailField>
        <DetailField label={C.field.position}>
          {contact.position ?? "—"}
        </DetailField>
        <DetailField label={C.field.email}>{contact.email ?? "—"}</DetailField>
        <DetailField label={C.field.phone}>{contact.phone ?? "—"}</DetailField>
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
    </DetailSheet>
  );
}
