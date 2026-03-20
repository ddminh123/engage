"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormSheet } from "@/components/shared/FormSheet";
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { calculateWorkingDays } from "@/lib/workingDays";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { COMMON_LABELS, PLAN_LABELS } from "@/constants/labels";
import { usePlans, useAddPlannedAudit } from "../hooks/usePlans";
import type { AuditableEntity } from "@/features/universe/types";

const C = COMMON_LABELS;
const L = PLAN_LABELS.audit;

const PRIORITY_OPTIONS = Object.entries(L.priority).map(([value, label]) => ({
  value,
  label,
}));

const formSchema = z.object({
  planId: z.string().min(1, "Vui lòng chọn kế hoạch"),
  title: z.string().optional(),
  objective: z.string().optional(),
  scheduledStart: z
    .string()
    .min(1, C.validation.required(L.field.scheduledStart)),
  scheduledEnd: z.string().min(1, C.validation.required(L.field.scheduledEnd)),
  priority: z.string().optional(),
  estimatedDays: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddToPlanDialogProps {
  entity: AuditableEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddToPlanDialog({
  entity,
  open,
  onOpenChange,
  onSuccess,
}: AddToPlanDialogProps) {
  const { data: plans = [] } = usePlans();
  const addMutation = useAddPlannedAudit();

  // Only show draft plans (can add audits)
  const draftPlans = React.useMemo(
    () =>
      plans
        .filter((p) => p.status === "draft")
        .map((p) => ({
          value: p.id,
          label: `${p.title} (${new Date(p.periodStart).toLocaleDateString("vi-VN")} - ${new Date(p.periodEnd).toLocaleDateString("vi-VN")})`,
        })),
    [plans],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: "",
      title: "",
      objective: "",
      scheduledStart: "",
      scheduledEnd: "",
      priority: "",
      estimatedDays: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        planId: draftPlans.length === 1 ? draftPlans[0].value : "",
        title: "",
        objective: "",
        scheduledStart: "",
        scheduledEnd: "",
        priority: "",
        estimatedDays: "",
        notes: "",
      });
    }
  }, [open, draftPlans, form]);

  // Auto-calculate working days when dates change
  const scheduledStart = form.watch("scheduledStart");
  const scheduledEnd = form.watch("scheduledEnd");

  React.useEffect(() => {
    if (scheduledStart && scheduledEnd) {
      const workingDays = calculateWorkingDays(scheduledStart, scheduledEnd);
      if (workingDays > 0) {
        form.setValue("estimatedDays", workingDays.toString());
      }
    }
  }, [scheduledStart, scheduledEnd, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!entity) return;

    try {
      await addMutation.mutateAsync({
        planId: values.planId,
        data: {
          entityId: entity.id,
          title: values.title || null,
          objective: values.objective || null,
          scheduledStart: values.scheduledStart,
          scheduledEnd: values.scheduledEnd,
          priority: values.priority || null,
          estimatedDays: values.estimatedDays
            ? parseInt(values.estimatedDays, 10)
            : null,
          notes: values.notes || null,
        },
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  if (!entity) return null;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Thêm vào kế hoạch kiểm toán"
      size="md"
      footer={
        draftPlans.length > 0 && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addMutation.isPending}
            >
              {C.action.cancel}
            </Button>
            <Button
              type="submit"
              form="add-to-plan-form"
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? C.action.saving : C.action.save}
            </Button>
          </>
        )
      }
    >
      <div className="mb-4 rounded-md border bg-muted/50 p-3">
        <p className="text-sm font-medium">{entity.name}</p>
        {entity.entityType && (
          <p className="text-xs text-muted-foreground">
            {entity.entityType.name}
          </p>
        )}
      </div>

      {draftPlans.length === 0 ? (
        <p className="py-4 text-center text-muted-foreground">
          Không có kế hoạch nào ở trạng thái bản nháp để thêm cuộc kiểm toán.
        </p>
      ) : (
        <Form {...form}>
          <form
            id="add-to-plan-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kế hoạch</FormLabel>
                  <FormControl>
                    <LabeledSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={draftPlans}
                      placeholder="Chọn kế hoạch"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.title}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Để trống sẽ sử dụng tên đối tượng"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.objective}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mục tiêu cuộc kiểm toán..."
                      rows={2}
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
                name="scheduledStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.scheduledStart}</FormLabel>
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
                name="scheduledEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.scheduledEnd}</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.priority}</FormLabel>
                    <FormControl>
                      <LabeledSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        options={PRIORITY_OPTIONS}
                        placeholder="Chọn mức ưu tiên"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{L.field.estimatedDays}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="VD: 10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      )}
    </FormSheet>
  );
}
