"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusSelect } from "@/components/shared/StatusSelect";
import { ContactSelector } from "./ContactSelector";
import { OrgUnitSelector } from "./OrgUnitSelector";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import { useOrgUnitForm, STATUS_OPTIONS } from "../hooks/useOrgUnitForm";
import type { Contact, OrgUnit, OrgUnitCreateInput } from "../types";

const L = SETTINGS_LABELS.orgUnit;
const C = COMMON_LABELS;

interface OrgUnitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: OrgUnit | null;
  defaultParent?: OrgUnit | null;
  onSubmit: (data: OrgUnitCreateInput) => void;
  onCreateContact?: (role: "leader" | "contactPoint") => void;
  isLoading?: boolean;
  hidden?: boolean;
  mutationError?: string | null;
}

export interface OrgUnitFormHandle {
  setLeader: React.Dispatch<React.SetStateAction<Contact | null>>;
  setContactPoint: React.Dispatch<React.SetStateAction<Contact | null>>;
}

export const OrgUnitForm = React.forwardRef<
  OrgUnitFormHandle,
  OrgUnitFormProps
>(function OrgUnitForm(
  {
    open,
    onOpenChange,
    initialData,
    defaultParent,
    onSubmit,
    onCreateContact,
    isLoading,
    hidden,
    mutationError,
  },
  ref,
) {
  const {
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
  } = useOrgUnitForm({
    open,
    onOpenChange,
    initialData,
    defaultParent,
    onSubmit,
  });

  // Expose setters so parent can inject a newly-created contact
  React.useImperativeHandle(ref, () => ({ setLeader, setContactPoint }), []);

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        onRequestClose={requestClose}
        hidden={hidden}
        title={initialData ? L.editTitle : L.createTitle}
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={requestClose}>
              {C.action.cancel}
            </Button>
            <Button type="submit" form="org-unit-form" disabled={isLoading}>
              {isLoading
                ? C.action.saving
                : initialData
                  ? C.action.update
                  : C.action.create}
            </Button>
          </>
        }
      >
        <Form {...form}>
          <form
            id="org-unit-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormSection title={L.section.basic} hideDivider>
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

              <div className="grid grid-cols-2 gap-4">
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{L.field.status}</FormLabel>
                      <FormControl>
                        <StatusSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={STATUS_OPTIONS}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {L.field.parent}
                </label>
                <div className="mt-2">
                  <OrgUnitSelector
                    value={parent}
                    onChange={handleParentChange}
                    excludeId={initialData?.id}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.description}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={L.placeholder.description}
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title={L.section.leader}>
              <ContactSelector
                value={leader}
                onChange={handleLeaderChange}
                onCreateNew={
                  onCreateContact ? () => onCreateContact("leader") : undefined
                }
                placeholder={L.leader.namePlaceholder}
              />
            </FormSection>

            <FormSection title={L.section.contactPoint}>
              <ContactSelector
                value={contactPoint}
                onChange={handleContactPointChange}
                onCreateNew={
                  onCreateContact
                    ? () => onCreateContact("contactPoint")
                    : undefined
                }
                placeholder={L.contactPoint.namePlaceholder}
              />
            </FormSection>

            {mutationError && (
              <p className="text-sm font-medium text-destructive">
                {mutationError}
              </p>
            )}
          </form>
        </Form>
      </FormDialog>
      <ConfirmDialog {...discardDialogProps} />
    </>
  );
});
