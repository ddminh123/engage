"use client";

import * as React from "react";
import { Plus, ExternalLink } from "lucide-react";
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
import { FormSheet } from "@/components/shared/FormSheet";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import {
  MultiSelectCommand,
  type MultiSelectOption,
} from "@/components/shared/MultiSelectCommand";
import { Separator } from "@/components/ui/separator";
import { COMMON_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import type {
  EngagementProcedure,
  ProcedureInput,
  ProcedureUpdateInput,
} from "../../types";

const C = COMMON_LABELS;
const LP = ENGAGEMENT_LABELS.procedure;

const TYPE_OPTIONS = Object.entries(LP.procedureType).map(([v, l]) => ({
  value: v,
  label: l,
}));
const CATEGORY_OPTIONS = Object.entries(LP.procedureCategory).map(([v, l]) => ({
  value: v,
  label: l,
}));
const PRIORITY_OPTIONS = [
  { value: "high", label: "Cao" },
  { value: "medium", label: "Trung bình" },
  { value: "low", label: "Thấp" },
];

const formSchema = z.object({
  title: z.string().min(1, C.validation.required(LP.field.title)),
  description: z.string().optional(),
  procedureType: z.string().optional(),
  procedureCategory: z.string().optional(),
  priority: z.string().optional(),
  observations: z.string().optional(),
  conclusion: z.string().optional(),
  sampleSize: z.string().optional(),
  exceptions: z.string().optional(),
  reviewNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProcedureFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EngagementProcedure | null;
  onSubmit: (data: ProcedureInput | ProcedureUpdateInput) => void;
  isLoading?: boolean;
  controlOptions?: MultiSelectOption[];
  riskOptions?: MultiSelectOption[];
  objectiveOptions?: MultiSelectOption[];
  onAddFinding?: (procedureId: string) => void;
  onViewFinding?: (findingId: string) => void;
}

export function ProcedureFormSheet({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
  controlOptions = [],
  riskOptions = [],
  objectiveOptions = [],
  onAddFinding,
  onViewFinding,
}: ProcedureFormSheetProps) {
  const isEdit = !!initialData;

  // Multi-select state (managed outside react-hook-form for simplicity)
  const [controlRefIds, setControlRefIds] = React.useState<string[]>([]);
  const [riskRefIds, setRiskRefIds] = React.useState<string[]>([]);
  const [objectiveRefIds, setObjectiveRefIds] = React.useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      procedureType: "",
      procedureCategory: "",
      priority: "",
      observations: "",
      conclusion: "",
      sampleSize: "",
      exceptions: "",
      reviewNotes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
        procedureType: initialData?.procedureType ?? "",
        procedureCategory: initialData?.procedureCategory ?? "",
        priority: initialData?.priority ?? "",
        observations: initialData?.observations ?? "",
        conclusion: initialData?.conclusion ?? "",
        sampleSize: initialData?.sampleSize?.toString() ?? "",
        exceptions: initialData?.exceptions?.toString() ?? "",
        reviewNotes: initialData?.reviewNotes ?? "",
      });
      setControlRefIds(initialData?.linkedControls?.map((c) => c.id) ?? []);
      setRiskRefIds(initialData?.linkedRisks?.map((r) => r.id) ?? []);
      setObjectiveRefIds(initialData?.linkedObjectives?.map((o) => o.id) ?? []);
    }
  }, [open, initialData, form]);

  const handleSubmit = (values: FormValues) => {
    if (isEdit) {
      const data: ProcedureUpdateInput = {
        title: values.title,
        description: values.description || null,
        procedureType: values.procedureType || null,
        procedureCategory: values.procedureCategory || null,
        priority: values.priority || null,
        observations: values.observations || null,
        conclusion: values.conclusion || null,
        sampleSize: values.sampleSize ? parseInt(values.sampleSize, 10) : null,
        exceptions: values.exceptions ? parseInt(values.exceptions, 10) : null,
        reviewNotes: values.reviewNotes || null,
        controlRefIds,
        riskRefIds,
        objectiveRefIds,
      };
      onSubmit(data);
    } else {
      const data: ProcedureInput = {
        title: values.title,
        description: values.description || null,
        procedureType: values.procedureType || null,
        procedureCategory: values.procedureCategory || null,
        priority: values.priority || null,
        controlRefIds,
        riskRefIds,
        objectiveRefIds,
      };
      onSubmit(data);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? LP.editTitle : LP.createTitle}
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
                <FormLabel>{LP.field.title} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="VD: Chọn mẫu 25 đơn hàng kiểm tra phê duyệt"
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
                <FormLabel>{LP.field.description}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả chi tiết thủ tục..."
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
              name="procedureType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LP.field.procedureType}</FormLabel>
                  <FormControl>
                    <LabeledSelect
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={TYPE_OPTIONS}
                      placeholder="Chọn loại"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="procedureCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phân loại</FormLabel>
                  <FormControl>
                    <LabeledSelect
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={CATEGORY_OPTIONS}
                      placeholder="Chọn phân loại"
                    />
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
                  <FormLabel>{LP.field.priority}</FormLabel>
                  <FormControl>
                    <LabeledSelect
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={PRIORITY_OPTIONS}
                      placeholder="Chọn mức"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Reference multi-selects */}
          {objectiveOptions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1.5">
                Mục tiêu RCM tham chiếu
              </p>
              <MultiSelectCommand
                options={objectiveOptions}
                selected={objectiveRefIds}
                onChange={setObjectiveRefIds}
                placeholder="Chọn mục tiêu..."
                searchPlaceholder="Tìm mục tiêu..."
              />
            </div>
          )}

          {riskOptions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1.5">Rủi ro tham chiếu</p>
              <MultiSelectCommand
                options={riskOptions}
                selected={riskRefIds}
                onChange={setRiskRefIds}
                placeholder="Chọn rủi ro..."
                searchPlaceholder="Tìm rủi ro..."
              />
            </div>
          )}

          {controlOptions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1.5">Kiểm soát tham chiếu</p>
              <MultiSelectCommand
                options={controlOptions}
                selected={controlRefIds}
                onChange={setControlRefIds}
                placeholder="Chọn kiểm soát..."
                searchPlaceholder="Tìm kiểm soát..."
              />
            </div>
          )}

          {/* Execution fields — only shown when editing */}
          {isEdit && (
            <>
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{LP.field.observations}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ghi nhận kết quả thực hiện..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conclusion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{LP.field.conclusion}</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Kết luận..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sampleSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{LP.field.sampleSize}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exceptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{LP.field.exceptions}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reviewNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{LP.field.reviewNotes}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ghi chú soát xét..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Linked findings — edit mode only */}
          {isEdit && initialData && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Phát hiện liên quan</p>
                  {onAddFinding && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onAddFinding(initialData.id)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Thêm phát hiện
                    </Button>
                  )}
                </div>
                {initialData.linkedFindings.length > 0 ? (
                  <div className="space-y-1.5">
                    {initialData.linkedFindings.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                      >
                        <span className="flex-1 truncate">{f.title}</span>
                        {onViewFinding && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onViewFinding(f.id)}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có phát hiện nào.
                  </p>
                )}
              </div>
            </>
          )}
        </form>
      </Form>
    </FormSheet>
  );
}
