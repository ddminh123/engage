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
} from "@/components/ui/form";
import { FormSheet } from "@/components/shared/FormSheet";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { COMMON_LABELS } from "@/constants/labels";
import {
  useCreateRiskCatalogueItem,
  useUpdateRiskCatalogueItem,
} from "../hooks/useRiskCatalogue";
import type { RiskCatalogueItem } from "../types";

const C = COMMON_LABELS;

export const RISK_TYPE_OPTIONS = [
  { value: "operational", label: "Vận hành" },
  { value: "technology", label: "Công nghệ" },
  { value: "credit", label: "Tín dụng" },
  { value: "compliance", label: "Tuân thủ" },
  { value: "market", label: "Thị trường" },
  { value: "liquidity", label: "Thanh khoản" },
  { value: "strategic", label: "Chiến lược" },
  { value: "reputational", label: "Uy tín" },
];

export const RISK_DOMAIN_OPTIONS = [
  { value: "ESG", label: "ESG" },
  { value: "financial_reporting", label: "Báo cáo tài chính" },
  { value: "regulatory", label: "Quy định pháp luật" },
  { value: "IT", label: "Công nghệ thông tin" },
  { value: "operations", label: "Vận hành" },
  { value: "fraud", label: "Gian lận" },
  { value: "other", label: "Khác" },
];

export const RISK_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  RISK_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export const RISK_DOMAIN_LABELS: Record<string, string> = Object.fromEntries(
  RISK_DOMAIN_OPTIONS.map((o) => [o.value, o.label]),
);

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  code: z.string().optional(),
  description: z.string().optional(),
  riskType: z.string().min(1, "Bắt buộc"),
  riskDomain: z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface RiskCatalogueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: RiskCatalogueItem | null;
}

export function RiskCatalogueForm({
  open,
  onOpenChange,
  initialData,
}: RiskCatalogueFormProps) {
  const isEdit = !!initialData;
  const createMutation = useCreateRiskCatalogueItem();
  const updateMutation = useUpdateRiskCatalogueItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      riskType: "operational",
      riskDomain: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name ?? "",
        code: initialData?.code ?? "",
        description: initialData?.description ?? "",
        riskType: initialData?.riskType ?? "operational",
        riskDomain: initialData?.riskDomain ?? "",
        isActive: initialData?.isActive ?? true,
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
            riskType: values.riskType,
            riskDomain: values.riskDomain || null,
            isActive: values.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          code: values.code || undefined,
          description: values.description || undefined,
          riskType: values.riskType,
          riskDomain: values.riskDomain || undefined,
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
      title={isEdit ? "Chỉnh sửa rủi ro" : "Thêm rủi ro vào thư viện"}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {C.action.cancel}
          </Button>
          <Button
            type="submit"
            form="risk-catalogue-form"
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
          id="risk-catalogue-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên rủi ro *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="VD: Rủi ro an ninh mạng"
                    {...field}
                  />
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
                  <Input placeholder="VD: TECH-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="riskType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại rủi ro *</FormLabel>
                <FormControl>
                  <LabeledSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={RISK_TYPE_OPTIONS}
                    placeholder="Chọn loại rủi ro"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="riskDomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lĩnh vực</FormLabel>
                <FormControl>
                  <LabeledSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={[
                      { value: "", label: "— Không chọn —" },
                      ...RISK_DOMAIN_OPTIONS,
                    ]}
                    placeholder="Chọn lĩnh vực"
                  />
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

          {isEdit && (
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Đang sử dụng</FormLabel>
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
          )}

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
