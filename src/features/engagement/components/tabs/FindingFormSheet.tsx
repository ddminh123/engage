"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormSheet } from "@/components/shared/FormSheet";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import {
  MultiSelectCommand,
  type MultiSelectOption,
} from "@/components/shared/MultiSelectCommand";
import { COMMON_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import type {
  EngagementProcedure,
  DraftFinding,
  FindingInput,
  FindingUpdateInput,
} from "../../types";

const C = COMMON_LABELS;
const LF = ENGAGEMENT_LABELS.finding;

const RISK_OPTIONS = Object.entries(LF.riskRating).map(([v, l]) => ({
  value: v,
  label: l,
}));
const STATUS_OPTIONS = Object.entries(LF.status).map(([v, l]) => ({
  value: v,
  label: l,
}));

const formSchema = z.object({
  title: z.string().min(1, C.validation.required(LF.field.title)),
  description: z.string().optional(),
  riskRating: z.string().optional(),
  status: z.string().optional(),
  recommendation: z.string().optional(),
  managementResponse: z.string().optional(),
  rootCause: z.string().optional(),
  procedureIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface FindingFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DraftFinding | null;
  allProcedures: EngagementProcedure[];
  onSubmit: (data: FindingInput | FindingUpdateInput) => void;
  isLoading?: boolean;
  riskOwnerOptions?: MultiSelectOption[];
  unitOwnerOptions?: MultiSelectOption[];
}

export function FindingFormSheet({
  open,
  onOpenChange,
  initialData,
  allProcedures,
  onSubmit,
  isLoading,
  riskOwnerOptions = [],
  unitOwnerOptions = [],
}: FindingFormSheetProps) {
  const isEdit = !!initialData;

  // Multi-select state for owners
  const [riskOwnerIds, setRiskOwnerIds] = React.useState<string[]>([]);
  const [unitOwnerIds, setUnitOwnerIds] = React.useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      riskRating: "",
      status: "",
      recommendation: "",
      managementResponse: "",
      rootCause: "",
      procedureIds: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
        riskRating: initialData?.riskRating ?? "",
        status: initialData?.status ?? "draft",
        recommendation: initialData?.recommendation ?? "",
        managementResponse: initialData?.managementResponse ?? "",
        rootCause: initialData?.rootCause ?? "",
        procedureIds: initialData?.linkedProcedures.map((p) => p.id) ?? [],
      });
      setRiskOwnerIds(initialData?.riskOwners?.map((o) => o.id) ?? []);
      setUnitOwnerIds(initialData?.unitOwners?.map((o) => o.id) ?? []);
    }
  }, [open, initialData, form]);

  const handleSubmit = (values: FormValues) => {
    const base = {
      title: values.title,
      description: values.description || null,
      riskRating: values.riskRating || null,
      recommendation: values.recommendation || null,
      managementResponse: values.managementResponse || null,
      rootCause: values.rootCause || null,
      procedureIds: values.procedureIds,
      riskOwnerIds,
      unitOwnerIds,
    };
    if (isEdit) {
      onSubmit({
        ...base,
        status: values.status || undefined,
      } as FindingUpdateInput);
    } else {
      onSubmit(base as FindingInput);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? LF.editTitle : LF.createTitle}
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
                <FormLabel>{LF.field.title} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="VD: Thiếu phê duyệt đơn hàng trên 50 triệu"
                    {...field}
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
                <FormLabel>{LF.field.description}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả chi tiết phát hiện..."
                    rows={3}
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
              name="riskRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LF.field.riskRating}</FormLabel>
                  <FormControl>
                    <LabeledSelect
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={RISK_OPTIONS}
                      placeholder="Chọn mức rủi ro"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{LF.field.status}</FormLabel>
                    <FormControl>
                      <LabeledSelect
                        value={field.value ?? "draft"}
                        onChange={field.onChange}
                        options={STATUS_OPTIONS}
                        placeholder="Trạng thái"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="rootCause"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LF.field.rootCause}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nguyên nhân gốc..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recommendation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LF.field.recommendation}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Kiến nghị khắc phục..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="managementResponse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LF.field.managementResponse}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Phản hồi của ban quản lý..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Procedure multi-select */}
          <FormField
            control={form.control}
            name="procedureIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LF.field.linkedProcedures}</FormLabel>
                <FormControl>
                  <ProcedureMultiSelect
                    value={field.value}
                    onChange={field.onChange}
                    procedures={allProcedures}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Owner multi-selects */}
          {riskOwnerOptions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1.5">Chủ rủi ro</p>
              <MultiSelectCommand
                options={riskOwnerOptions}
                selected={riskOwnerIds}
                onChange={setRiskOwnerIds}
                placeholder="Chọn chủ rủi ro..."
                searchPlaceholder="Tìm liên hệ..."
              />
            </div>
          )}

          {unitOwnerOptions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1.5">
                Đơn vị chịu trách nhiệm
              </p>
              <MultiSelectCommand
                options={unitOwnerOptions}
                selected={unitOwnerIds}
                onChange={setUnitOwnerIds}
                placeholder="Chọn đơn vị..."
                searchPlaceholder="Tìm đơn vị..."
              />
            </div>
          )}
        </form>
      </Form>
    </FormSheet>
  );
}

// ── Procedure multi-select using Popover + checkboxes ──

function ProcedureMultiSelect({
  value,
  onChange,
  procedures,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  procedures: EngagementProcedure[];
}) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  };

  const selectedNames = procedures
    .filter((p) => value.includes(p.id))
    .map((p) => p.title);

  return (
    <div className="space-y-2">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start font-normal"
            />
          }
        >
          {value.length > 0 ? (
            <span className="truncate">{value.length} thủ tục đã chọn</span>
          ) : (
            <span className="text-muted-foreground">
              Chọn thủ tục liên quan...
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="max-h-[250px] overflow-y-auto p-1">
            {procedures.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Chưa có thủ tục nào.
              </div>
            ) : (
              procedures.map((proc) => {
                const selected = value.includes(proc.id);
                return (
                  <button
                    key={proc.id}
                    type="button"
                    onClick={() => toggle(proc.id)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border">
                      {selected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="truncate">{proc.title}</span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedNames.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedNames.map((name) => (
            <Badge key={name} variant="secondary" className="text-xs">
              {name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
