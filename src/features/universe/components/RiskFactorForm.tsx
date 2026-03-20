"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { FormSheet } from "@/components/shared/FormSheet";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { COMMON_LABELS } from "@/constants/labels";
import {
  useCreateRiskAssessmentFactor,
  useUpdateRiskAssessmentFactor,
} from "../hooks/useRiskFactors";
import type { RiskAssessmentFactor } from "../types";

const C = COMMON_LABELS;

const RELATES_TO_OPTIONS = [
  { value: "impact", label: "Mức độ ảnh hưởng" },
  { value: "likelihood", label: "Khả năng xảy ra" },
  { value: "control", label: "Môi trường kiểm soát" },
];

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  description: z.string().optional(),
  relates_to: z.enum(["impact", "likelihood", "control"]),
  is_positive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface RiskFactorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: RiskAssessmentFactor | null;
}

export function RiskFactorForm({
  open,
  onOpenChange,
  initialData,
}: RiskFactorFormProps) {
  const isEdit = !!initialData;
  const createMutation = useCreateRiskAssessmentFactor();
  const updateMutation = useUpdateRiskAssessmentFactor();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      relates_to: "impact",
      is_positive: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        relates_to: initialData?.relatesTo ?? "impact",
        is_positive: initialData?.isPositive ?? false,
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
            description: values.description || null,
            relates_to: values.relates_to,
            is_positive: values.is_positive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          description: values.description || null,
          relates_to: values.relates_to,
          is_positive: values.is_positive,
        });
      }
      onOpenChange(false);
    } catch {
      // Error captured by mutation state
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEdit
          ? "Chỉnh sửa yếu tố đánh giá rủi ro"
          : "Thêm yếu tố đánh giá rủi ro"
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {C.action.cancel}
          </Button>
          <Button type="submit" form="risk-factor-form" disabled={isPending}>
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
          id="risk-factor-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên yếu tố *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="VD: Khối lượng giao dịch lớn"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relates_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Liên quan đến *</FormLabel>
                <FormControl>
                  <LabeledSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={RELATES_TO_OPTIONS}
                    placeholder="Chọn loại"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_positive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Yếu tố tích cực</FormLabel>
                  <FormDescription>
                    Bật nếu yếu tố này giúp giảm thiểu rủi ro (VD: Quy trình
                    được chuẩn hóa)
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
    </FormSheet>
  );
}
