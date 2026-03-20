import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import { useFormGuard } from "@/hooks/useFormGuard";
import { useCreateContact, useUpdateContact } from "./useContacts";
import { useOrgUnits } from "./useOrgUnits";
import type { Contact, ContactInput, OrgUnit } from "../types";

const C = COMMON_LABELS;
const LC = SETTINGS_LABELS.contact;

export const CONTACT_STATUS_OPTIONS = [
  { value: "active", label: LC.status.active, color: "bg-green-500" },
  { value: "inactive", label: LC.status.inactive, color: "bg-gray-400" },
] as const;

export const contactFormSchema = z.object({
  name: z.string().min(1, C.validation.required(C.field.name)),
  position: z.string().optional(),
  email: z.string().email(C.validation.invalidEmail).optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

interface UseContactFormOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Contact | null;
  onSubmit: (data: ContactInput) => void;
}

export function useContactForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: UseContactFormOptions) {
  const [unit, setUnit] = React.useState<OrgUnit | null>(null);
  const [localDirty, setLocalDirty] = React.useState(false);

  const { data: allUnits = [] } = useOrgUnits({ status: "active" });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      position: "",
      email: "",
      phone: "",
      status: "active",
    },
  });

  // Reset on open
  React.useEffect(() => {
    if (!open) return;
    form.reset({
      name: initialData?.name ?? "",
      position: initialData?.position ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      status: initialData?.status ?? "active",
    });
    setUnit(
      initialData?.unitId
        ? (allUnits.find((u) => u.id === initialData.unitId) ?? null)
        : null,
    );
    setLocalDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isDirty = form.formState.isDirty || localDirty;

  const { requestClose, discardDialogProps } = useFormGuard({
    open,
    onOpenChange,
    isDirty,
  });

  const handleUnitChange = (v: OrgUnit | null) => {
    setUnit(v);
    setLocalDirty(true);
  };

  const handleSubmit = (values: ContactFormValues) => {
    onSubmit({
      name: values.name,
      position: values.position || null,
      email: values.email || null,
      phone: values.phone || null,
      unitId: unit?.id ?? null,
      status: values.status,
    });
  };

  return {
    form,
    unit,
    handleUnitChange,
    handleSubmit,
    requestClose,
    discardDialogProps,
    title: initialData ? LC.editTitle : LC.createTitle,
    isEditing: !!initialData,
  };
}
