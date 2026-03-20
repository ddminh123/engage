"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { COMMON_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import type { EngagementObjective, ObjectiveInput } from "../../types";

const C = COMMON_LABELS;
const L = ENGAGEMENT_LABELS.objective;

const formSchema = z.object({
  title: z.string().min(1, C.validation.required(L.field.title)),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ObjectiveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EngagementObjective | null;
  onSubmit: (data: ObjectiveInput) => void;
  isLoading?: boolean;
}

export function ObjectiveFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: ObjectiveFormDialogProps) {
  const isEdit = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "" },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      title: values.title,
      description: values.description || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? L.editTitle : L.createTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.title} *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Xác minh phê duyệt đơn hàng" {...field} />
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
                    <Textarea placeholder="Mô tả mục tiêu..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {C.action.cancel}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? C.action.saving : isEdit ? C.action.update : C.action.save}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
