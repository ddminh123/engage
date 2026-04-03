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
  useCreateProcedureCatalogItem,
  useUpdateProcedureCatalogItem,
} from "../hooks/useRiskCatalog";
import type { ProcedureCatalogItem } from "../types/riskCatalog";

const C = COMMON_LABELS;
const L = SETTINGS_LABELS.riskCatalog;
const PL = ENGAGEMENT_LABELS.procedure;

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  code: z.string().optional(),
  description: z.string().optional(),
  procedureType: z.string().optional(),
  procedureCategory: z.string().optional(),
  frameworkRef: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProcedureCatalogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: ProcedureCatalogItem | null;
}

export function ProcedureCatalogForm({
  open,
  onOpenChange,
  editItem,
}: ProcedureCatalogFormProps) {
  const isEdit = !!editItem;
  const createMutation = useCreateProcedureCatalogItem();
  const updateMutation = useUpdateProcedureCatalogItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      procedureType: "",
      procedureCategory: "",
      frameworkRef: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: editItem?.name ?? "",
        code: editItem?.code ?? "",
        description: editItem?.description ?? "",
        procedureType: editItem?.procedureType ?? "",
        procedureCategory: editItem?.procedureCategory ?? "",
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
      procedureType: values.procedureType || null,
      procedureCategory: values.procedureCategory || null,
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
      title={isEdit ? L.procedure.editTitle : L.procedure.createTitle}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {C.action.cancel}
          </Button>
          <Button
            type="submit"
            form="procedure-catalog-form"
            disabled={isPending}
          >
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
          id="procedure-catalog-form"
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
                  <Input placeholder="Tên thủ tục" {...field} />
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
                  <Input placeholder="VD: P-001" {...field} />
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
                    placeholder="Mô tả thủ tục (không bắt buộc)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="procedureType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.procedureType}</FormLabel>
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
                      {Object.entries(PL.procedureType).map(([key, label]) => (
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
              name="procedureCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.procedureCategory}</FormLabel>
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
                      {Object.entries(PL.procedureCategory).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key} label={label}>
                            {label}
                          </SelectItem>
                        ),
                      )}
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
