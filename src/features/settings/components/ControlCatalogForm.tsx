"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormDialog } from "@/components/shared/FormDialog";
import { COMMON_LABELS, SETTINGS_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import {
  useCreateControlCatalogItem,
  useUpdateControlCatalogItem,
} from "../hooks/useRiskCatalog";
import type { ControlCatalogItem } from "../types/riskCatalog";

const C = COMMON_LABELS;
const L = SETTINGS_LABELS.riskCatalog;
const EL = ENGAGEMENT_LABELS.risk;

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  code: z.string().optional(),
  description: z.string().optional(),
  controlType: z.string().optional(),
  controlNature: z.string().optional(),
  frequency: z.string().optional(),
  frameworkRef: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ControlCatalogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: ControlCatalogItem | null;
}

export function ControlCatalogForm({
  open,
  onOpenChange,
  editItem,
}: ControlCatalogFormProps) {
  const isEdit = !!editItem;
  const createMutation = useCreateControlCatalogItem();
  const updateMutation = useUpdateControlCatalogItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      controlType: "",
      controlNature: "",
      frequency: "",
      frameworkRef: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: editItem?.name ?? "",
        code: editItem?.code ?? "",
        description: editItem?.description ?? "",
        controlType: editItem?.controlType ?? "",
        controlNature: editItem?.controlNature ?? "",
        frequency: editItem?.frequency ?? "",
        frameworkRef: editItem?.frameworkRef ?? "",
      });
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError =
    createMutation.error?.message ?? updateMutation.error?.message ?? null;

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      code: values.code || null,
      description: values.description || null,
      controlType: values.controlType || null,
      controlNature: values.controlNature || null,
      frequency: values.frequency || null,
      frameworkRef: values.frameworkRef || null,
      source: "custom",
    };

    try {
      if (isEdit && editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {
      // Error captured by mutation state
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? L.control.editTitle : L.control.createTitle}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {C.action.cancel}
          </Button>
          <Button type="submit" form="control-catalog-form" disabled={isPending}>
            {isPending
              ? C.action.saving
              : isEdit
                ? C.action.update
                : C.action.create}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          id="control-catalog-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{L.field.name} *</FormLabel>
                <FormControl>
                  <Input placeholder="Tên kiểm soát" {...field} />
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
                  <Input placeholder="VD: C-001" {...field} />
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
                    rows={3}
                    placeholder="Mô tả kiểm soát (không bắt buộc)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="controlType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.controlType}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(EL.controlType).map(([key, label]) => (
                        <SelectItem key={key} value={key} label={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="controlNature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.controlNature}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(EL.controlNature).map(([key, label]) => (
                        <SelectItem key={key} value={key} label={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.frequency}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(EL.controlFrequency).map(([key, label]) => (
                        <SelectItem key={key} value={key} label={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="frameworkRef"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{L.field.frameworkRef}</FormLabel>
                <FormControl>
                  <Input placeholder="VD: COBIT DSS05.01" {...field} />
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
  );
}
