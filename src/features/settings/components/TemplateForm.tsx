"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { FormDialog } from "@/components/shared/FormDialog";
import { COMMON_LABELS } from "@/constants/labels";
import {
  TEMPLATE_ENTITY_TYPES,
  templateEntityTypeLabel,
} from "@/constants/entityTypes";
import {
  useCreateTemplate,
  useTemplateCategories,
  useCreateTemplateCategory,
} from "../hooks/useTemplates";
import type { Template } from "../types";

const C = COMMON_LABELS;

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  entity_type: z.string().min(1, "Bắt buộc"),
  category_id: z.string().optional(),
  new_category_name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (template: Template) => void;
}

export function TemplateForm({
  open,
  onOpenChange,
  onCreated,
}: TemplateFormProps) {
  const createMutation = useCreateTemplate();
  const { data: categories = [] } = useTemplateCategories();
  const createCategoryMutation = useCreateTemplateCategory();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      entity_type: "procedure",
      category_id: "",
      new_category_name: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        entity_type: "procedure",
        category_id: "",
        new_category_name: "",
      });
      createMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isPending =
    createMutation.isPending || createCategoryMutation.isPending;
  const mutationError = createMutation.error?.message ?? null;

  // Flatten categories for the select (parent → child)
  const flatCategories = categories.flatMap((cat) => [
    { id: cat.id, name: cat.name },
    ...(cat.children ?? []).map((c) => ({
      id: c.id,
      name: `  └ ${c.name}`,
    })),
  ]);

  const handleSubmit = async (values: FormValues) => {
    try {
      let categoryId = values.category_id || null;

      // Create new category if provided
      if (values.new_category_name?.trim()) {
        const newCat = await createCategoryMutation.mutateAsync({
          name: values.new_category_name.trim(),
          parent_id: null,
        });
        categoryId = newCat.id;
      }

      const created = await createMutation.mutateAsync({
        name: values.name,
        content: { type: "doc", content: [] },
        entity_type: values.entity_type,
        category_id: categoryId,
      });

      if (onCreated) {
        onCreated(created);
      } else {
        onOpenChange(false);
      }
    } catch {
      // Error captured by mutation state
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thêm mẫu"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {C.action.cancel}
          </Button>
          <Button type="submit" form="template-form" disabled={isPending}>
            {isPending ? C.action.saving : C.action.create}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          id="template-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên mẫu *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="VD: Mẫu kiểm tra IT General Controls"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Entity type */}
          <FormField
            control={form.control}
            name="entity_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại đối tượng *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <span className="flex flex-1 text-left truncate">
                        {templateEntityTypeLabel(field.value)}
                      </span>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TEMPLATE_ENTITY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} label={t.label}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <Select
                    onValueChange={(v) =>
                      field.onChange(!v || v === "__none__" ? "" : v)
                    }
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <span className="flex flex-1 text-left truncate text-muted-foreground">
                          {field.value
                            ? (flatCategories.find((c) => c.id === field.value)
                                ?.name ?? field.value)
                            : "Chọn danh mục (tùy chọn)"}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__" label="Không có">
                        Không có
                      </SelectItem>
                      {flatCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id} label={c.name}>
                          {c.name}
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
              name="new_category_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hoặc tạo mới</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Planning → IT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
