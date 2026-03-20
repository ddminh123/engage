"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormSection } from "@/components/shared/FormSection";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SearchableInput } from "@/components/shared/SearchableInput";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { COMMON_LABELS, UNIVERSE_LABELS } from "@/constants/labels";
import {
  ContactSelector,
  ContactSelectorMulti,
} from "@/features/settings/components/ContactSelector";
import { OrgUnitCardPopover } from "@/features/settings/components/OrgUnitCard";
import { useOrgUnitSearch } from "@/features/settings/hooks/useOrgUnits";
import { useEntityTypes } from "@/features/settings/hooks/useEntityTypes";
import { useAuditAreas } from "@/features/settings/hooks/useAuditAreas";
import { useEntityForm, AUDIT_CYCLE_OPTIONS } from "../hooks/useEntityForm";
import type { AuditableEntity, EntityInput } from "../types";
import type { OrgUnit, Contact, AuditArea } from "@/features/settings/types";

const C = COMMON_LABELS;
const L = UNIVERSE_LABELS.entity;

const AUDIT_CYCLE_SELECT_OPTIONS = AUDIT_CYCLE_OPTIONS.map((c) => ({
  value: c,
  label: L.auditCycle[c as keyof typeof L.auditCycle] ?? c,
}));

interface EntityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AuditableEntity | null;
  onSubmit: (data: EntityInput) => void;
  isLoading?: boolean;
  mutationError?: string | null;
}

export function EntityForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
  mutationError,
}: EntityFormProps) {
  const {
    form,
    areaIds,
    setAreaIds,
    areaError,
    setOwnerUnitIds,
    setParticipatingUnitIds,
    setAuditSponsorIds,
    setAuditeeRepIds,
    setContactPointIds,
    ownerUnitError,
    handleSubmit,
    requestClose,
    discardDialogProps,
    title,
    isEditing,
  } = useEntityForm({ open, onOpenChange, initialData, onSubmit });

  // ── Dynamic reference data ──
  const { data: entityTypes = [] } = useEntityTypes();
  const { data: auditAreas = [] } = useAuditAreas();

  const entityTypeOptions = React.useMemo(
    () => entityTypes.map((t) => ({ value: t.id, label: t.name })),
    [entityTypes],
  );

  // ── Areas multi-select state ──
  const [selectedAreas, setSelectedAreas] = React.useState<AuditArea[]>([]);

  // ── Org unit multi-select state ──
  const [ownerQuery, setOwnerQuery] = React.useState("");
  const { data: ownerResults = [] } = useOrgUnitSearch(ownerQuery);
  const [ownerUnits, setOwnerUnits] = React.useState<OrgUnit[]>([]);

  const [participQuery, setParticipQuery] = React.useState("");
  const { data: participResults = [] } = useOrgUnitSearch(participQuery);
  const [participUnits, setParticipUnits] = React.useState<OrgUnit[]>([]);

  // ── Contact selector state ──
  const [sponsorContacts, setSponsorContacts] = React.useState<Contact[]>([]);
  const [auditeeReps, setAuditeeRepsLocal] = React.useState<Contact[]>([]);
  const [contactPoints, setContactPointsLocal] = React.useState<Contact[]>([]);

  // Sync on open (resolve initial objects from initialData)
  React.useEffect(() => {
    if (!open) return;
    setSelectedAreas(
      (initialData?.areas ?? []).map(
        (a) => ({ id: a.id, name: a.name }) as AuditArea,
      ),
    );
    setOwnerUnits(
      (initialData?.ownerUnits ?? []).map(
        (u) => ({ id: u.id, name: u.name }) as OrgUnit,
      ),
    );
    setParticipUnits(
      (initialData?.participatingUnits ?? []).map(
        (u) => ({ id: u.id, name: u.name }) as OrgUnit,
      ),
    );
    setSponsorContacts(
      (initialData?.auditSponsors ?? []).map(
        (c) => ({ id: c.id, name: c.name, position: c.position }) as Contact,
      ),
    );
    setAuditeeRepsLocal(
      (initialData?.auditeeReps ?? []).map(
        (c) => ({ id: c.id, name: c.name, position: c.position }) as Contact,
      ),
    );
    setContactPointsLocal(
      (initialData?.contactPoints ?? []).map(
        (c) => ({ id: c.id, name: c.name, position: c.position }) as Contact,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Handlers ──
  const handleAreasChange = (areas: AuditArea[]) => {
    setSelectedAreas(areas);
    setAreaIds(areas.map((a) => a.id));
  };

  const handleOwnerUnitsChange = (units: OrgUnit[]) => {
    setOwnerUnits(units);
    setOwnerUnitIds(units.map((u) => u.id));
  };

  const handleParticipUnitsChange = (units: OrgUnit[]) => {
    setParticipUnits(units);
    setParticipatingUnitIds(units.map((u) => u.id));
  };

  const handleSponsorsChange = (contacts: Contact[]) => {
    setSponsorContacts(contacts);
    setAuditSponsorIds(contacts.map((c) => c.id));
  };

  const handleAuditeeRepsChange = (contacts: Contact[]) => {
    setAuditeeRepsLocal(contacts);
    setAuditeeRepIds(contacts.map((c) => c.id));
  };

  const handleContactPointsChange = (contacts: Contact[]) => {
    setContactPointsLocal(contacts);
    setContactPointIds(contacts.map((c) => c.id));
  };

  const handleCreateContact = () => {};

  return (
    <>
      <FormSheet
        open={open}
        onOpenChange={onOpenChange}
        onRequestClose={requestClose}
        title={title}
        size="xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={requestClose}>
              {C.action.cancel}
            </Button>
            <Button type="submit" form="entity-form" disabled={isLoading}>
              {isLoading
                ? C.action.saving
                : isEditing
                  ? C.action.update
                  : C.action.create}
            </Button>
          </>
        }
      >
        <Form {...form}>
          <form
            id="entity-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* ── Basic Info ── */}
            <FormSection title={L.section.basic}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.name} *</FormLabel>
                    <FormControl>
                      <Input placeholder={L.placeholder.name} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.code}</FormLabel>
                    <FormControl>
                      <Input placeholder={L.placeholder.code} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.entityType} *</FormLabel>
                    <FormControl>
                      <LabeledSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={entityTypeOptions}
                        placeholder={L.placeholder.entityType}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {L.field.area} *
                </label>
                <SearchableInput
                  multiple
                  value={selectedAreas}
                  onChange={handleAreasChange}
                  options={auditAreas.filter((a) => a.isActive)}
                  getDisplayValue={(a: AuditArea) => a.name}
                  onQueryChange={() => {}}
                  placeholder={L.placeholder.area}
                  noResultsText={C.table.noData}
                />
                {areaError && (
                  <p className="text-sm font-medium text-destructive">
                    {areaError}
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="auditCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.auditCycle}</FormLabel>
                    <FormControl>
                      <LabeledSelect
                        value={field.value || ""}
                        onChange={(v) => field.onChange(v || "")}
                        options={AUDIT_CYCLE_SELECT_OPTIONS}
                        placeholder={L.placeholder.auditCycle}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastAuditedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.lastAuditedAt}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            />
                          }
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), "dd/MM/yyyy", {
                              locale: vi,
                            })
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(date?.toISOString() ?? null)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.description}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={L.placeholder.description}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* ── Units ── */}
            <FormSection title={L.section.units}>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {L.field.ownerUnit} *
                </label>
                <SearchableInput
                  multiple
                  value={ownerUnits}
                  onChange={handleOwnerUnitsChange}
                  options={ownerResults}
                  getDisplayValue={(u: OrgUnit) =>
                    u.code ? `${u.name} (${u.code})` : u.name
                  }
                  onQueryChange={setOwnerQuery}
                  placeholder={L.placeholder.ownerUnit}
                  noResultsText={C.table.noData}
                  getParentId={(u: OrgUnit) => u.parentId}
                  renderChipLabel={(u: OrgUnit) => (
                    <OrgUnitCardPopover id={u.id}>{u.name}</OrgUnitCardPopover>
                  )}
                />
                {ownerUnitError && (
                  <p className="text-sm font-medium text-destructive">
                    {ownerUnitError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {L.field.participatingUnits}
                </label>
                <SearchableInput
                  multiple
                  value={participUnits}
                  onChange={handleParticipUnitsChange}
                  options={participResults}
                  getDisplayValue={(u: OrgUnit) =>
                    u.code ? `${u.name} (${u.code})` : u.name
                  }
                  onQueryChange={setParticipQuery}
                  placeholder={L.placeholder.participatingUnits}
                  noResultsText={C.table.noData}
                  getParentId={(u: OrgUnit) => u.parentId}
                  renderChipLabel={(u: OrgUnit) => (
                    <OrgUnitCardPopover id={u.id}>{u.name}</OrgUnitCardPopover>
                  )}
                />
              </div>
            </FormSection>

            {/* ── Key Contacts ── */}
            <FormSection title={L.section.contacts}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {L.field.auditeeRep}
                  </label>
                  <ContactSelectorMulti
                    value={auditeeReps}
                    onChange={handleAuditeeRepsChange}
                    onCreateNew={handleCreateContact}
                    placeholder={L.placeholder.auditeeRep}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {L.field.contactPoint}
                  </label>
                  <ContactSelectorMulti
                    value={contactPoints}
                    onChange={handleContactPointsChange}
                    onCreateNew={handleCreateContact}
                    placeholder={L.placeholder.contactPoint}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {L.field.auditSponsor}
                </label>
                <ContactSelectorMulti
                  value={sponsorContacts}
                  onChange={handleSponsorsChange}
                  onCreateNew={handleCreateContact}
                  placeholder={L.placeholder.auditSponsor}
                />
              </div>
            </FormSection>

            {mutationError && (
              <p className="text-sm font-medium text-destructive">
                {mutationError}
              </p>
            )}
          </form>
        </Form>
      </FormSheet>
      <ConfirmDialog {...discardDialogProps} />
    </>
  );
}
