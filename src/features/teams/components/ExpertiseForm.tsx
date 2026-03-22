"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateExpertise, useUpdateExpertise } from "../hooks/useExpertise";
import { TEAMS_LABELS } from "@/constants/labels/teams";
import { Loader2 } from "lucide-react";
import type { Expertise } from "../types";

const L = TEAMS_LABELS;

const expertiseFormSchema = z.object({
  label: z.string().min(1, "Vui lòng nhập tên chuyên môn"),
  code: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type ExpertiseFormValues = z.infer<typeof expertiseFormSchema>;

interface ExpertiseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Expertise | null;
}

export function ExpertiseForm({ open, onOpenChange, initialData }: ExpertiseFormProps) {
  const isEdit = !!initialData;
  const createMutation = useCreateExpertise();
  const updateMutation = useUpdateExpertise();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<ExpertiseFormValues>({
    resolver: zodResolver(expertiseFormSchema),
    defaultValues: {
      label: "",
      code: "",
      description: "",
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          label: initialData.label,
          code: initialData.code || "",
          description: initialData.description || "",
          isActive: initialData.is_active,
        });
      } else {
        form.reset({
          label: "",
          code: "",
          description: "",
          isActive: true,
        });
      }
    }
  }, [open, initialData, form]);

  const onSubmit = async (values: ExpertiseFormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
    } catch {
      // handled by mutation
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? L.EXPERTISE_EDIT : L.EXPERTISE_CREATE}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">{L.EXPERTISE_LABEL} *</Label>
          <Input id="label" {...form.register("label")} />
          {form.formState.errors.label && (
            <p className="text-xs text-destructive">{form.formState.errors.label.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">{L.EXPERTISE_CODE}</Label>
          <Input id="code" {...form.register("code")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exp-description">{L.EXPERTISE_DESCRIPTION}</Label>
          <Textarea
            id="exp-description"
            rows={3}
            {...form.register("description")}
          />
        </div>

        {isEdit && (
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", !!checked)}
            />
            <Label>Đang sử dụng</Label>
          </div>
        )}
      </div>
    </FormDialog>
  );
}
