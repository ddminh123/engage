"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormDialog } from "@/components/shared/FormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusSelect } from "@/components/shared/StatusSelect";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import {
  useContactForm,
  CONTACT_STATUS_OPTIONS,
} from "../hooks/useContactForm";
import { OrgUnitSearch } from "./OrgUnitSearch";
import type { Contact, ContactInput } from "../types";

const C = COMMON_LABELS;
const LC = SETTINGS_LABELS.contact;

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Contact | null;
  onSubmit: (data: ContactInput) => void;
  isLoading?: boolean;
  mutationError?: string | null;
}

export function ContactForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
  mutationError,
}: ContactFormProps) {
  const {
    form,
    unit,
    handleUnitChange,
    handleSubmit,
    requestClose,
    discardDialogProps,
    title,
    isEditing,
  } = useContactForm({ open, onOpenChange, initialData, onSubmit });

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        onRequestClose={requestClose}
        title={title}
        size="md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={requestClose}>
              {C.action.cancel}
            </Button>
            <Button type="submit" form="contact-form" disabled={isLoading}>
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
            id="contact-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{C.field.name} *</FormLabel>
                  <FormControl>
                    <Input placeholder={LC.placeholder.name} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{C.field.position}</FormLabel>
                  <FormControl>
                    <Input placeholder={LC.placeholder.position} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{C.field.email}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={LC.placeholder.email}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{C.field.phone}</FormLabel>
                    <FormControl>
                      <Input placeholder={LC.placeholder.phone} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium leading-none">
                {LC.field.unit}
              </label>
              <div className="mt-2">
                <OrgUnitSearch
                  value={unit}
                  onChange={handleUnitChange}
                  placeholder={LC.placeholder.unit}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{C.field.status}</FormLabel>
                  <FormControl>
                    <StatusSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={CONTACT_STATUS_OPTIONS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
}
