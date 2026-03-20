"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormSection } from "@/components/shared/FormSection";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { ScoreButtonGroup } from "@/components/shared/ScoreButtonGroup";
import { FactorPicker } from "@/components/shared/FactorPicker";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { COMMON_LABELS, UNIVERSE_LABELS } from "@/constants/labels";
import { useCreateRiskAssessment } from "../hooks/useEntities";
import { useRiskAssessmentFactors } from "../hooks/useRiskFactors";
import { useAssessmentSources } from "../hooks/useAssessmentSources";
import { CONTROL_EFFECTIVENESS } from "../constants";
import type { AuditableEntity, RiskAssessmentFactor } from "../types";
import { cn } from "@/lib/utils";

const C = COMMON_LABELS;
const L = UNIVERSE_LABELS.entity;

// ── Helpers ──

function scoreToLevel(score: number): "Low" | "Medium" | "High" | "Critical" {
  if (score <= 4) return "Low";
  if (score <= 9) return "Medium";
  if (score <= 16) return "High";
  return "Critical";
}

function calcResidual(baseScore: number, control: string): number {
  if (control === "Strong") return Math.max(1, Math.round(baseScore * 0.4));
  if (control === "Medium") return Math.max(1, Math.round(baseScore * 0.7));
  return baseScore;
}

const LEVEL_DOT: Record<string, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  Critical: "bg-red-600",
};

const LEVEL_LABEL: Record<string, string> = {
  Low: L.riskLevel.Low,
  Medium: L.riskLevel.Medium,
  High: L.riskLevel.High,
  Critical: L.riskLevel.Critical,
};

const SCORE_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const score = i + 1;
  const level = scoreToLevel(score);
  return {
    value: String(score),
    label: `${score} - ${LEVEL_LABEL[level]}`,
    level,
  };
});

function ScoreSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const renderDot = (opt: { value: string; label: string }) => {
    const score = parseInt(opt.value);
    const level = isNaN(score) ? "" : scoreToLevel(score);
    return (
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "inline-block size-2.5 shrink-0 rounded-full",
            LEVEL_DOT[level] ?? "bg-muted-foreground/30",
          )}
        />
        {opt.label}
      </span>
    );
  };

  return (
    <LabeledSelect
      value={value}
      onChange={onChange}
      options={SCORE_OPTIONS}
      placeholder={placeholder}
      renderValue={renderDot}
      renderOption={renderDot}
    />
  );
}

// ── Zod Schema ──

const riskFormSchema = z.object({
  // Section 1: Inherent Risk
  inherentScore: z.number().int().min(1).max(25),
  inherentImpact: z.number().int().min(1).max(5).optional(),
  inherentLikelihood: z.number().int().min(1).max(5).optional(),
  impactRationale: z.string().optional(),
  likelihoodRationale: z.string().optional(),
  impactFactors: z.array(z.string()),
  likelihoodFactors: z.array(z.string()),
  // Section 2: Control Environment
  controlEffectiveness: z.string().optional(),
  controlRationale: z.string().optional(),
  controlFactors: z.array(z.string()),
  // Section 3: Assessment Info
  note: z.string().optional(),
  assessmentSourceId: z.string().optional(),
  managementRequest: z.boolean(),
  // Section 4: Residual Risk
  residualScore: z.number().int().min(1).max(25).optional(),
  residualLevel: z.string().optional(),
  conclusion: z.string().optional(),
  // Section 5: Metadata
  evaluatedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  evaluationDate: z.date(),
});

type RiskFormValues = z.infer<typeof riskFormSchema>;

// ── Filter helpers ──

function filterFactors(factors: RiskAssessmentFactor[], relatesTo: string) {
  return factors
    .filter((f) => f.relatesTo === relatesTo)
    .map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      isPositive: f.isPositive,
    }));
}

// ── Component ──

interface RiskRatingFormProps {
  entity: AuditableEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RiskRatingForm({
  entity,
  open,
  onOpenChange,
  onSuccess,
}: RiskRatingFormProps) {
  const createMutation = useCreateRiskAssessment();
  const { data: allFactors = [] } = useRiskAssessmentFactors();
  const { data: assessmentSources = [] } = useAssessmentSources();
  const [residualOverridden, setResidualOverridden] = React.useState(false);
  const [showImpactRationale, setShowImpactRationale] = React.useState(false);
  const [showLikelihoodRationale, setShowLikelihoodRationale] =
    React.useState(false);
  const [showControlRationale, setShowControlRationale] = React.useState(false);

  const impactFactorOptions = React.useMemo(
    () => filterFactors(allFactors, "impact"),
    [allFactors],
  );
  const likelihoodFactorOptions = React.useMemo(
    () => filterFactors(allFactors, "likelihood"),
    [allFactors],
  );
  const controlFactorOptions = React.useMemo(
    () => filterFactors(allFactors, "control"),
    [allFactors],
  );

  const sourceOptions = React.useMemo(
    () => [
      { value: "", label: "— Chọn nguồn —" },
      ...assessmentSources.map((s) => ({ value: s.id, label: s.name })),
    ],
    [assessmentSources],
  );

  const form = useForm<RiskFormValues>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      inherentScore: undefined as unknown as number,
      inherentImpact: undefined,
      inherentLikelihood: undefined,
      impactRationale: "",
      likelihoodRationale: "",
      impactFactors: [],
      likelihoodFactors: [],
      controlEffectiveness: "",
      controlRationale: "",
      controlFactors: [],
      note: "",
      assessmentSourceId: "",
      managementRequest: false,
      residualScore: undefined,
      residualLevel: undefined as unknown as string,
      conclusion: "",
      evaluatedBy: "",
      approvedBy: "",
      evaluationDate: new Date(),
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        inherentScore: undefined as unknown as number,
        inherentImpact: undefined,
        inherentLikelihood: undefined,
        impactRationale: "",
        likelihoodRationale: "",
        impactFactors: [],
        likelihoodFactors: [],
        controlEffectiveness: "",
        controlRationale: "",
        controlFactors: [],
        note: "",
        assessmentSourceId: "",
        managementRequest: false,
        residualScore: undefined,
        residualLevel: undefined as unknown as string,
        conclusion: "",
        evaluatedBy: "",
        approvedBy: "",
        evaluationDate: new Date(),
      });
      setResidualOverridden(false);
      setShowImpactRationale(false);
      setShowLikelihoodRationale(false);
      setShowControlRationale(false);
      createMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const inherentImpact = form.watch("inherentImpact");
  const inherentLikelihood = form.watch("inherentLikelihood");
  const controlEffectiveness = form.watch("controlEffectiveness") ?? "";
  const inherentScore = form.watch("inherentScore");
  const residualLevel = form.watch("residualLevel");

  // Auto-calculate inherentScore from I×L
  const computedScore =
    inherentImpact && inherentLikelihood
      ? inherentImpact * inherentLikelihood
      : null;

  React.useEffect(() => {
    if (computedScore !== null) {
      form.setValue("inherentScore", computedScore);
    }
  }, [computedScore, form]);

  // Auto-update residual when inherentScore or control changes (unless overridden)
  React.useEffect(() => {
    if (residualOverridden) return;
    if (!inherentScore) return;
    const auto = calcResidual(inherentScore, controlEffectiveness);
    form.setValue("residualScore", auto);
    form.setValue("residualLevel", scoreToLevel(auto));
  }, [inherentScore, controlEffectiveness, residualOverridden, form]);

  const handleSubmit = async (values: RiskFormValues) => {
    if (!entity) return;
    try {
      await createMutation.mutateAsync({
        entityId: entity.id,
        inherentScore: values.inherentScore,
        inherentImpact: values.inherentImpact ?? null,
        inherentLikelihood: values.inherentLikelihood ?? null,
        impactRationale: values.impactRationale || null,
        likelihoodRationale: values.likelihoodRationale || null,
        controlEffectiveness: values.controlEffectiveness || null,
        controlRationale: values.controlRationale || null,
        riskFactors: {
          impact: values.impactFactors,
          likelihood: values.likelihoodFactors,
          control: values.controlFactors,
        },
        assessmentSourceId: values.assessmentSourceId || null,
        note: values.note || null,
        managementRequest: values.managementRequest,
        residualScore: values.residualScore ?? null,
        residualLevel: values.residualLevel || null,
        conclusion: values.conclusion || null,
        evaluatedBy: values.evaluatedBy || null,
        approvedBy: values.approvedBy || null,
        evaluationDate: values.evaluationDate.toISOString(),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error captured by mutation state
    }
  };

  const inherentLevel = inherentScore ? scoreToLevel(inherentScore) : null;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`${L.section.risk} — ${entity?.name ?? ""}`}
      size="lg"
      footerClassName="flex-col items-stretch gap-0 p-0"
      footer={
        <>
          {/* Residual risk bar */}
          <div className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
            <span className="text-sm font-medium">
              {L.section.residualRisk}
            </span>
            {residualLevel && (
              <RiskLevelBadge
                level={residualLevel}
                label={
                  form.watch("residualScore")
                    ? `${form.watch("residualScore")} - ${L.riskLevel[residualLevel as keyof typeof L.riskLevel] ?? residualLevel}`
                    : (L.riskLevel[residualLevel as keyof typeof L.riskLevel] ??
                      residualLevel)
                }
                className="px-3 py-1 text-sm"
              />
            )}
          </div>
          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {C.action.cancel}
            </Button>
            <Button
              type="submit"
              form="risk-rating-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? C.action.saving : C.action.create}
            </Button>
          </div>
        </>
      }
    >
      <Form {...form}>
        <form
          id="risk-rating-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          {/* ══════════════════════════════════════════════════════
              Section 1: RỦI RO TIỀM TÀNG
              ══════════════════════════════════════════════════════ */}
          <FormSection title={L.section.inherentRisk}>
            {/* Impact 1-5 */}
            <FormField
              control={form.control}
              name="inherentImpact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.inherentImpact}</FormLabel>
                  <FormControl>
                    <ScoreButtonGroup
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Impact factors */}
            <FormField
              control={form.control}
              name="impactFactors"
              render={({ field }) => (
                <FormItem>
                  <p className="text-xs text-muted-foreground">
                    Yếu tố ảnh hưởng
                  </p>
                  <FormControl>
                    <FactorPicker
                      options={impactFactorOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="+Thêm yếu tố"
                      emptyMessage="Chưa có yếu tố. Thêm trong Cài đặt."
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Impact rationale (toggle) */}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto gap-1 px-0 text-xs text-muted-foreground"
              onClick={() => setShowImpactRationale((v) => !v)}
            >
              <Pencil className="h-3 w-3" />
              Lý do đánh giá tác động
            </Button>
            {showImpactRationale && (
              <FormField
                control={form.control}
                name="impactRationale"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea rows={2} placeholder="Lý do..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Likelihood 1-5 */}
            <FormField
              control={form.control}
              name="inherentLikelihood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.inherentLikelihood}</FormLabel>
                  <FormControl>
                    <ScoreButtonGroup
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Likelihood factors */}
            <FormField
              control={form.control}
              name="likelihoodFactors"
              render={({ field }) => (
                <FormItem>
                  <p className="text-xs text-muted-foreground">
                    Yếu tố ảnh hưởng
                  </p>
                  <FormControl>
                    <FactorPicker
                      options={likelihoodFactorOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="+Thêm yếu tố"
                      emptyMessage="Chưa có yếu tố. Thêm trong Cài đặt."
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Likelihood rationale (toggle) */}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto gap-1 px-0 text-xs text-muted-foreground"
              onClick={() => setShowLikelihoodRationale((v) => !v)}
            >
              <Pencil className="h-3 w-3" />
              Lý do đánh giá khả năng
            </Button>
            {showLikelihoodRationale && (
              <FormField
                control={form.control}
                name="likelihoodRationale"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea rows={2} placeholder="Lý do..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Inherent score — single select with dot+score+level, always editable */}
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">
                  {L.field.inherentScore}
                </span>
                <div className="w-48">
                  <ScoreSelect
                    value={inherentScore ? String(inherentScore) : ""}
                    onChange={(v) => {
                      const s = parseInt(v);
                      if (!isNaN(s)) form.setValue("inherentScore", s);
                    }}
                    placeholder="— Chưa tính —"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* ══════════════════════════════════════════════════════
              Section 2: MÔI TRƯỜNG KIỂM SOÁT
              ══════════════════════════════════════════════════════ */}
          <FormSection title={L.section.controlEffectiveness}>
            <FormField
              control={form.control}
              name="controlEffectiveness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.controlEffectiveness}</FormLabel>
                  <FormControl>
                    <ButtonGroup className="w-full">
                      {CONTROL_EFFECTIVENESS.map((v) => {
                        const isSelected = field.value === v;
                        return (
                          <Button
                            key={v}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "flex-1 gap-1.5",
                              !isSelected && "text-muted-foreground",
                            )}
                            onClick={() => field.onChange(isSelected ? "" : v)}
                          >
                            <span
                              className={cn(
                                "size-2 shrink-0 rounded-full",
                                LEVEL_DOT[
                                  v === "Strong"
                                    ? "Low"
                                    : v === "Medium"
                                      ? "Medium"
                                      : "Critical"
                                ],
                              )}
                            />
                            {L.controlEffectiveness[v]}
                          </Button>
                        );
                      })}
                    </ButtonGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Control factors */}
            <FormField
              control={form.control}
              name="controlFactors"
              render={({ field }) => (
                <FormItem>
                  <p className="text-xs text-muted-foreground">
                    Yếu tố kiểm soát
                  </p>
                  <FormControl>
                    <FactorPicker
                      options={controlFactorOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="+Thêm yếu tố"
                      emptyMessage="Chưa có yếu tố. Thêm trong Cài đặt."
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Control rationale (toggle) */}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto gap-1 px-0 text-xs text-muted-foreground"
              onClick={() => setShowControlRationale((v) => !v)}
            >
              <Pencil className="h-3 w-3" />
              Lý do đánh giá kiểm soát
            </Button>
            {showControlRationale && (
              <FormField
                control={form.control}
                name="controlRationale"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea rows={2} placeholder="Lý do..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </FormSection>

          {/* ══════════════════════════════════════════════════════
              Section 3: THÔNG TIN ĐÁNH GIÁ
              ══════════════════════════════════════════════════════ */}
          <FormSection title={L.section.assessmentContext}>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đánh giá chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhận xét, đánh giá chi tiết..."
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
              name="assessmentSourceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.field.assessmentSource}</FormLabel>
                  <FormControl>
                    <LabeledSelect
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={sourceOptions}
                      placeholder="— Chọn nguồn —"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managementRequest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Yêu cầu của ban lãnh đạo
                  </FormLabel>
                </FormItem>
              )}
            />
          </FormSection>

          {/* ══════════════════════════════════════════════════════
              Section 4: RỦI RO CÒN LẠI
              ══════════════════════════════════════════════════════ */}
          <FormSection title={L.section.residualRisk}>
            <FormField
              control={form.control}
              name="residualLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{L.section.residualRisk}</FormLabel>
                  <FormControl>
                    <ScoreSelect
                      value={
                        form.watch("residualScore")
                          ? String(form.watch("residualScore"))
                          : ""
                      }
                      onChange={(v) => {
                        const s = parseInt(v);
                        if (!isNaN(s)) {
                          form.setValue("residualScore", s);
                          field.onChange(scoreToLevel(s));
                          setResidualOverridden(true);
                        }
                      }}
                      placeholder="— Chưa tính —"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conclusion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kết luận</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Kết luận về mức rủi ro còn lại..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* ══════════════════════════════════════════════════════
              Section 5: THÔNG TIN KHÁC
              ══════════════════════════════════════════════════════ */}
          <FormSection title={L.section.assessmentMetadata}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="evaluatedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {L.field.evaluatedBy}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        (chờ tích hợp)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={L.placeholder.evaluatedBy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="approvedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {L.field.approvedBy}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        (chờ tích hợp)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={L.placeholder.approvedBy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="evaluationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{L.field.evaluationDate}</FormLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className={cn(
                            "w-56 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        />
                      }
                    >
                      {field.value
                        ? format(field.value, "dd/MM/yyyy", { locale: vi })
                        : "Chọn ngày"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => date && field.onChange(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {createMutation.error && (
            <p className="text-sm font-medium text-destructive">
              {createMutation.error.message}
            </p>
          )}
        </form>
      </Form>
    </FormSheet>
  );
}
