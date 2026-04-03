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
import { cn } from "@/lib/utils";
import { COMMON_LABELS, SETTINGS_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import {
  useCreateRiskCatalogItem,
  useUpdateRiskCatalogItem,
  useRiskCatalogTree,
} from "../hooks/useRiskCatalog";
import type { RiskCatalogItem } from "../types/riskCatalog";

const C = COMMON_LABELS;
const L = SETTINGS_LABELS.riskCatalog;
const RL = ENGAGEMENT_LABELS.risk;

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  code: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Bắt buộc"),
  riskType: z.string().optional(),
  riskRating: z.string().optional(),
  likelihood: z.string().optional(),
  impact: z.string().optional(),
  frameworkRef: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RiskCatalogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: RiskCatalogItem | null;
  defaultCategoryId?: string;
}

export function RiskCatalogForm({
  open,
  onOpenChange,
  editItem,
  defaultCategoryId,
}: RiskCatalogFormProps) {
  const isEdit = !!editItem;
  const createMutation = useCreateRiskCatalogItem();
  const updateMutation = useUpdateRiskCatalogItem();
  const { data: domains = [] } = useRiskCatalogTree();

  // Build flat category lookup for display
  const categoryLabel = (catId: string) => {
    for (const d of domains) {
      for (const c of d.categories) {
        if (c.id === catId) return `${d.name} / ${c.name}`;
      }
    }
    return catId;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      categoryId: "",
      riskType: "",
      riskRating: "",
      likelihood: "",
      impact: "",
      frameworkRef: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: editItem?.name ?? "",
        code: editItem?.code ?? "",
        description: editItem?.description ?? "",
        categoryId: editItem?.categoryId ?? defaultCategoryId ?? "",
        riskType: editItem?.riskType ?? "",
        riskRating: editItem?.riskRating ?? "",
        likelihood: editItem?.likelihood ?? "",
        impact: editItem?.impact ?? "",
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
      categoryId: values.categoryId,
      riskType: values.riskType || null,
      riskRating: values.riskRating || null,
      likelihood: values.likelihood || null,
      impact: values.impact || null,
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
      title={isEdit ? L.risk.editTitle : L.risk.createTitle}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {C.action.cancel}
          </Button>
          <Button type="submit" form="risk-catalog-form" disabled={isPending}>
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
          id="risk-catalog-form"
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
                  <Input placeholder="Tên rủi ro" {...field} />
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
                    <Input placeholder="VD: R-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.category} *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <span
                          className={cn(
                            "flex flex-1 text-left truncate",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? categoryLabel(field.value) : "Chọn danh mục"}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {domains.map((domain) =>
                        domain.categories.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id}
                            label={`${domain.name} / ${cat.name}`}
                          >
                            {domain.name} / {cat.name}
                          </SelectItem>
                        )),
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{L.field.description}</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Mô tả rủi ro (không bắt buộc)"
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
              name="riskType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.riskType}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <span
                          className={cn(
                            "flex flex-1 text-left truncate",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? (RL.riskCategory[field.value] ?? field.value)
                            : "Chọn loại"}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RL.riskCategory).map(([key, label]) => (
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
              name="riskRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.riskRating}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <span
                          className={cn(
                            "flex flex-1 text-left truncate",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? (RL.riskRating[field.value] ?? field.value)
                            : "Chọn mức"}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RL.riskRating).map(([key, label]) => (
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="likelihood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khả năng xảy ra</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <span
                          className={cn(
                            "flex flex-1 text-left truncate",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? (RL.likelihood[field.value] ?? field.value)
                            : "Chọn"}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RL.likelihood).map(([key, label]) => (
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
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mức độ tác động</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <span
                          className={cn(
                            "flex flex-1 text-left truncate",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? (RL.impact[field.value] ?? field.value)
                            : "Chọn"}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RL.impact).map(([key, label]) => (
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
