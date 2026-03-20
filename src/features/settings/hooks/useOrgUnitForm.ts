import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import { useFormGuard } from "@/hooks/useFormGuard";
import { useOrgUnits } from "./useOrgUnits";
import type { Contact, OrgUnit, OrgUnitCreateInput } from "../types";

const C = COMMON_LABELS;
const L = SETTINGS_LABELS.orgUnit;

export const STATUS_OPTIONS = [
  { value: "active", label: C.status.active, color: "bg-green-500" },
  { value: "inactive", label: C.status.inactive, color: "bg-gray-400" },
] as const;

export const orgUnitFormSchema = z.object({
  name: z.string().min(1, C.validation.required(L.field.name)),
  code: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  description: z.string().optional(),
});

export type OrgUnitFormValues = z.infer<typeof orgUnitFormSchema>;

interface UseOrgUnitFormOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: OrgUnit | null;
  defaultParent?: OrgUnit | null;
  onSubmit: (data: OrgUnitCreateInput) => void;
}

export function useOrgUnitForm({
  open,
  onOpenChange,
  initialData,
  defaultParent,
  onSubmit,
}: UseOrgUnitFormOptions) {
  const [leader, setLeader] = React.useState<Contact | null>(null);
  const [contactPoint, setContactPoint] = React.useState<Contact | null>(null);
  const [parent, setParent] = React.useState<OrgUnit | null>(null);
  const [localDirty, setLocalDirty] = React.useState(false);

  const form = useForm<OrgUnitFormValues>({
    resolver: zodResolver(orgUnitFormSchema),
    defaultValues: { name: "", code: "", status: "active", description: "" },
  });

  const { data: allUnits = [] } = useOrgUnits({ status: "active" });

  // Reset everything when dialog opens — single source of truth for initial state
  React.useEffect(() => {
    if (!open) return;
    form.reset({
      name: initialData?.name ?? "",
      code: initialData?.code ?? "",
      status: initialData?.status ?? "active",
      description: initialData?.description ?? "",
    });
    setLeader(initialData?.leader ?? null);
    setContactPoint(initialData?.contactPoint ?? null);
    setParent(
      initialData?.parentId
        ? (allUnits.find((u) => u.id === initialData.parentId) ?? null)
        : (defaultParent ?? null),
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

  const handleLeaderChange = (v: Contact | null) => {
    setLeader(v);
    setLocalDirty(true);
  };

  const handleContactPointChange = (v: Contact | null) => {
    setContactPoint(v);
    setLocalDirty(true);
  };

  const handleParentChange = (v: OrgUnit | null) => {
    setParent(v);
    setLocalDirty(true);
  };

  const handleSubmit = (values: OrgUnitFormValues) => {
    onSubmit({
      name: values.name,
      code: values.code || null,
      parentId: parent?.id || null,
      status: values.status,
      description: values.description || null,
      leader: leader
        ? { id: leader.id, name: leader.name, position: leader.position, email: leader.email, phone: leader.phone, status: leader.status }
        : null,
      contactPoint: contactPoint
        ? { id: contactPoint.id, name: contactPoint.name, position: contactPoint.position, email: contactPoint.email, phone: contactPoint.phone, status: contactPoint.status }
        : null,
    });
  };

  return {
    form,
    leader,
    setLeader,
    contactPoint,
    setContactPoint,
    parent,
    handleLeaderChange,
    handleContactPointChange,
    handleParentChange,
    handleSubmit,
    requestClose,
    discardDialogProps,
  };
}
