"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { COMMON_LABELS } from "@/constants/labels";
import {
  useCreateAuditArea,
  useUpdateAuditArea,
} from "../hooks/useAuditAreas";
import type { AuditArea } from "../types";

const C = COMMON_LABELS;

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  code: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AuditAreaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AuditArea | null;
}

export function AuditAreaForm({
  open,
  onOpenChange,
  initialData,
}: AuditAreaFormProps) {
  const isEdit = !!initialData;
  const createMutation = useCreateAuditArea();
  const updateMutation = useUpdateAuditArea();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", code: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name ?? "",
        code: initialData?.code ?? "",
        description: initialData?.description ?? "",
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
    try {
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            name: values.name,
            code: values.code || null,
            description: values.description || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          code: values.code || null,
          description: values.description || null,
        });
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
      title={isEdit ? "Chỉnh sửa lĩnh vực" : "Thêm lĩnh vực"}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {C.action.cancel}
          </Button>
          <Button type="submit" form="audit-area-form" disabled={isPending}>
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
          id="audit-area-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên lĩnh vực *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Tài chính" {...field} />
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
                <FormLabel>Mã</FormLabel>
                <FormControl>
                  <Input placeholder="VD: FINANCIAL" {...field} />
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
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="Mô tả ngắn (không bắt buộc)"
                    {...field}
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
  );
}
