"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, formatISO } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FormSheet } from "@/components/shared/FormSheet";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { COMMON_LABELS, PLAN_LABELS } from "@/constants/labels";
import type { PlanSummary, PlanInput } from "../types";

const C = COMMON_LABELS;
const L = PLAN_LABELS.plan;

const PERIOD_TYPE_OPTIONS = Object.entries(L.periodType).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

const formSchema = z.object({
  title: z.string().min(1, C.validation.required(L.field.title)),
  description: z.string().optional(),
  periodType: z.string().min(1, C.validation.required(L.field.periodType)),
  periodStart: z.string().min(1, C.validation.required(L.field.periodStart)),
  periodEnd: z.string().min(1, C.validation.required(L.field.periodEnd)),
});

type FormValues = z.infer<typeof formSchema>;

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PlanSummary | null;
  onSubmit: (data: PlanInput) => void;
  isLoading?: boolean;
}

export function PlanForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: PlanFormProps) {
  const isEdit = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      periodType: "annual",
      periodStart: "",
      periodEnd: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
        periodType: initialData?.periodType ?? "annual",
        periodStart: initialData?.periodStart
          ? new Date(initialData.periodStart).toISOString().split("T")[0]
          : "",
        periodEnd: initialData?.periodEnd
          ? new Date(initialData.periodEnd).toISOString().split("T")[0]
          : "",
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      title: values.title,
      description: values.description || null,
      periodType: values.periodType,
      periodStart: values.periodStart,
      periodEnd: values.periodEnd,
    });
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? L.editTitle : L.createTitle}
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {C.action.cancel}
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isLoading}
          >
            {isLoading
              ? C.action.saving
              : isEdit
                ? C.action.update
                : C.action.save}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{L.field.title}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="VD: Kế hoạch kiểm toán năm 2026"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{L.field.periodType}</FormLabel>
                <FormControl>
                  <LabeledSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={PERIOD_TYPE_OPTIONS}
                    placeholder="Chọn loại kỳ"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="periodStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.periodStart}</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          />
                        }
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy", {
                            locale: vi,
                          })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date ? format(date, "yyyy-MM-dd") : "",
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periodEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.periodEnd}</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          />
                        }
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy", {
                            locale: vi,
                          })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date ? format(date, "yyyy-MM-dd") : "",
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
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
                    placeholder="Phạm vi, phương pháp, ghi chú..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormSheet>
  );
}
