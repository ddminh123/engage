import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { COMMON_LABELS, UNIVERSE_LABELS } from "@/constants/labels";
import { useFormGuard } from "@/hooks/useFormGuard";
import { AUDIT_CYCLES } from "../constants";
import type { AuditableEntity, EntityInput } from "../types";

const C = COMMON_LABELS;
const L = UNIVERSE_LABELS.entity;

// EntityType and AuditArea are now dynamic — fetched from API via useEntityTypes() and useAuditAreas()
export const AUDIT_CYCLE_OPTIONS = [...AUDIT_CYCLES] as string[];
export const ENTITY_STATUS_OPTIONS = [
  { value: "active", label: L.status.active, color: "bg-green-500" },
  { value: "inactive", label: L.status.inactive, color: "bg-gray-400" },
  { value: "archived", label: L.status.archived, color: "bg-stone-400" },
] as const;

export const entityFormSchema = z.object({
  name: z.string().min(1, C.validation.required(L.field.name)),
  code: z.string().optional(),
  entityTypeId: z.string().min(1, C.validation.required(L.field.entityType)),
  auditCycle: z.string().optional(),
  lastAuditedAt: z.string().optional(),
  description: z.string().optional(),
});

export type EntityFormValues = z.infer<typeof entityFormSchema>;

interface UseEntityFormOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AuditableEntity | null;
  onSubmit: (data: EntityInput) => void;
}

export function useEntityForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: UseEntityFormOptions) {
  const [areaIds, setAreaIds] = React.useState<string[]>([]);
  const [ownerUnitIds, setOwnerUnitIds] = React.useState<string[]>([]);
  const [participatingUnitIds, setParticipatingUnitIds] = React.useState<string[]>([]);
  const [auditSponsorIds, setAuditSponsorIds] = React.useState<string[]>([]);
  const [auditeeRepIds, setAuditeeRepIds] = React.useState<string[]>([]);
  const [contactPointIds, setContactPointIds] = React.useState<string[]>([]);
  const [ownerUnitError, setOwnerUnitError] = React.useState("");
  const [areaError, setAreaError] = React.useState("");
  const [localDirty, setLocalDirty] = React.useState(false);

  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: {
      name: "",
      code: "",
      entityTypeId: "",
      auditCycle: "",
      lastAuditedAt: "",
      description: "",
    },
  });

  // Reset on open
  React.useEffect(() => {
    if (!open) return;
    form.reset({
      name: initialData?.name ?? "",
      code: initialData?.code ?? "",
      entityTypeId: initialData?.entityTypeId ?? "",
      auditCycle: initialData?.auditCycle ?? "",
      lastAuditedAt: initialData?.lastAuditedAt ?? "",
      description: initialData?.description ?? "",
    });
    setAreaIds(initialData?.areas.map((a) => a.id) ?? []);
    setOwnerUnitIds(initialData?.ownerUnits.map((u) => u.id) ?? []);
    setParticipatingUnitIds(initialData?.participatingUnits.map((u) => u.id) ?? []);
    setAuditSponsorIds(initialData?.auditSponsors.map((c) => c.id) ?? []);
    setAuditeeRepIds(initialData?.auditeeReps.map((c) => c.id) ?? []);
    setContactPointIds(initialData?.contactPoints.map((c) => c.id) ?? []);
    setOwnerUnitError("");
    setAreaError("");
    setLocalDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isDirty = form.formState.isDirty || localDirty;

  const { requestClose, discardDialogProps } = useFormGuard({
    open,
    onOpenChange,
    isDirty,
  });

  const handleSubmit = (values: EntityFormValues) => {
    let hasError = false;
    if (ownerUnitIds.length === 0) {
      setOwnerUnitError(C.validation.required(L.field.ownerUnit));
      hasError = true;
    } else {
      setOwnerUnitError("");
    }
    if (areaIds.length === 0) {
      setAreaError(C.validation.required(L.field.area));
      hasError = true;
    } else {
      setAreaError("");
    }
    if (hasError) return;

    onSubmit({
      name: values.name,
      code: values.code || null,
      entityTypeId: values.entityTypeId,
      areaIds,
      ownerUnitIds,
      participatingUnitIds,
      status: initialData?.status ?? "active",
      auditCycle: values.auditCycle || null,
      lastAuditedAt: values.lastAuditedAt || null,
      auditSponsorIds,
      auditeeRepIds,
      contactPointIds,
      description: values.description || null,
    });
  };

  return {
    form,
    areaIds,
    setAreaIds: (ids: string[]) => { setAreaIds(ids); setLocalDirty(true); },
    areaError,
    ownerUnitIds,
    setOwnerUnitIds: (ids: string[]) => { setOwnerUnitIds(ids); setLocalDirty(true); },
    participatingUnitIds,
    setParticipatingUnitIds: (ids: string[]) => { setParticipatingUnitIds(ids); setLocalDirty(true); },
    auditSponsorIds,
    setAuditSponsorIds: (ids: string[]) => { setAuditSponsorIds(ids); setLocalDirty(true); },
    auditeeRepIds,
    setAuditeeRepIds: (ids: string[]) => { setAuditeeRepIds(ids); setLocalDirty(true); },
    contactPointIds,
    setContactPointIds: (ids: string[]) => { setContactPointIds(ids); setLocalDirty(true); },
    ownerUnitError,
    handleSubmit,
    requestClose,
    discardDialogProps,
    title: initialData ? L.editTitle : L.createTitle,
    isEditing: !!initialData,
  };
}
