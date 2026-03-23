"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { JSONContent } from "@tiptap/core";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/shared/FormDialog";
import { COMMON_LABELS } from "@/constants/labels";
import { TemplateEditor } from "./TemplateEditor";
import {
  useCreateTemplate,
  useUpdateTemplate,
  useTemplateCategories,
  useCreateTemplateCategory,
} from "../hooks/useTemplates";
import type { Template } from "../types";

const C = COMMON_LABELS;

const ENTITY_TYPES = [
  { value: "procedure", label: "Thủ tục kiểm toán" },
  { value: "entity_risk_assessment", label: "Đánh giá rủi ro" },
];

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  description: z.string().optional(),
  entity_type: z.string().min(1, "Bắt buộc"),
  category_id: z.string().optional(),
  new_category_name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Template | null;
}

export function TemplateForm({
  open,
  onOpenChange,
  initialData,
}: TemplateFormProps) {
  const isEdit = !!initialData;
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const { data: categories = [] } = useTemplateCategories();
  const createCategoryMutation = useCreateTemplateCategory();

  const [editorContent, setEditorContent] = useState<JSONContent>(
    (initialData?.content as JSONContent) ?? { type: "doc", content: [] },
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      entity_type: "procedure",
      category_id: "",
      new_category_name: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        entity_type: initialData?.entityType ?? "procedure",
        category_id: initialData?.categoryId ?? "",
        new_category_name: "",
      });
      setEditorContent(
        (initialData?.content as JSONContent) ?? { type: "doc", content: [] },
      );
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleEditorChange = useCallback((content: JSONContent) => {
    setEditorContent(content);
  }, []);

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    createCategoryMutation.isPending;
  const mutationError =
    createMutation.error?.message ??
    updateMutation.error?.message ??
    null;

  // Flatten categories for the select (parent → child)
  const flatCategories = categories.flatMap((cat) => [
    { id: cat.id, name: cat.name, isParent: true },
    ...(cat.children ?? []).map((c) => ({
      id: c.id,
      name: `  └ ${c.name}`,
      isParent: false,
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

      const payload = {
        name: values.name,
        description: values.description || null,
        content: editorContent,
        entity_type: values.entity_type,
        category_id: categoryId,
      };

      if (isEdit && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        });
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
      title={isEdit ? "Chỉnh sửa mẫu" : "Thêm mẫu"}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {C.action.cancel}
          </Button>
          <Button type="submit" form="template-form" disabled={isPending}>
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
          id="template-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          {/* Row 1: Name + Entity type */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên mẫu *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Mẫu kiểm tra IT General Controls" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="entity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại đối tượng *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENTITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: Category + New category */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục (tùy chọn)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Không có</SelectItem>
                      {flatCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
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
                  <FormLabel>Hoặc tạo danh mục mới</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Planning → IT"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Description */}
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

          {/* Row 4: Rich text editor for content */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nội dung mẫu</label>
            <TemplateEditor
              content={editorContent}
              onChange={handleEditorChange}
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
