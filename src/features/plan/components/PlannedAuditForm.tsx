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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { calculateWorkingDays } from "@/lib/workingDays";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormSection } from "@/components/shared/FormSection";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { SearchableInput } from "@/components/shared/SearchableInput";
import { COMMON_LABELS, PLAN_LABELS } from "@/constants/labels";
import { useEntities } from "@/features/universe/hooks/useEntities";
import { useOrgUnitSearch } from "@/features/settings/hooks/useOrgUnits";
import { OrgUnitCardPopover } from "@/features/settings/components/OrgUnitCard";
import { ContactSelectorMulti } from "@/features/settings/components/ContactSelector";
import type { OrgUnit, Contact } from "@/features/settings/types";
import type { PlannedAudit, PlannedAuditInput } from "../types";

const C = COMMON_LABELS;
const L = PLAN_LABELS.audit;

const PRIORITY_OPTIONS = Object.entries(L.priority).map(([value, label]) => ({
  value,
  label,
}));

const formSchema = z.object({
  entityId: z.string().min(1, C.validation.required(L.field.entity)),
  title: z.string().optional(),
  objective: z.string().optional(),
  scope: z.string().optional(),
  scheduledStart: z
    .string()
    .min(1, C.validation.required(L.field.scheduledStart)),
  scheduledEnd: z.string().min(1, C.validation.required(L.field.scheduledEnd)),
  priority: z.string().optional(),
  estimatedDays: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PlannedAuditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PlannedAudit | null;
  onSubmit: (data: PlannedAuditInput) => void;
  isLoading?: boolean;
}

export function PlannedAuditForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: PlannedAuditFormProps) {
  const isEdit = !!initialData;
  const { data: entities = [] } = useEntities();

  // ── Org unit multi-select state ──
  const [ownerQuery, setOwnerQuery] = React.useState("");
  const { data: ownerResults = [] } = useOrgUnitSearch(ownerQuery);
  const [ownerUnits, setOwnerUnits] = React.useState<OrgUnit[]>([]);

  const [participQuery, setParticipQuery] = React.useState("");
  const { data: participResults = [] } = useOrgUnitSearch(participQuery);
  const [participUnits, setParticipUnits] = React.useState<OrgUnit[]>([]);

  // ── Contact selector state ──
  const [auditeeReps, setAuditeeReps] = React.useState<Contact[]>([]);
  const [contactPoints, setContactPoints] = React.useState<Contact[]>([]);

  const entityOptions = React.useMemo(
    () =>
      entities
        .filter((e) => e.status === "active")
        .map((e) => ({
          value: e.id,
          label: e.name + (e.code ? ` (${e.code})` : ""),
        })),
    [entities],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entityId: "",
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
        entityId: initialData?.entityId ?? "",
        title: initialData?.title ?? "",
        objective: initialData?.objective ?? "",
        scope: initialData?.scope ?? "",
        scheduledStart: initialData?.scheduledStart
          ? format(new Date(initialData.scheduledStart), "yyyy-MM-dd")
          : "",
        scheduledEnd: initialData?.scheduledEnd
          ? format(new Date(initialData.scheduledEnd), "yyyy-MM-dd")
          : "",
        priority: initialData?.priority ?? "",
        estimatedDays: initialData?.estimatedDays?.toString() ?? "",
        notes: initialData?.notes ?? "",
      });
      setOwnerUnits(
        (initialData?.ownerUnits ?? []).map(
          (u) => ({ id: u.id, name: u.name }) as OrgUnit,
        ),
      );
      setParticipUnits(
        (initialData?.participatingUnits ?? []).map(
          (u) => ({ id: u.id, name: u.name }) as OrgUnit,
        ),
      );
      setAuditeeReps(
        (initialData?.auditeeReps ?? []).map(
          (c) => ({ id: c.id, name: c.name, position: c.position }) as Contact,
        ),
      );
      setContactPoints(
        (initialData?.contactPoints ?? []).map(
          (c) => ({ id: c.id, name: c.name, position: c.position }) as Contact,
        ),
      );
    }
  }, [open, initialData, form]);

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

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      entityId: values.entityId,
      title: values.title || null,
      objective: values.objective || null,
      scope: values.scope || null,
      scheduledStart: values.scheduledStart,
      scheduledEnd: values.scheduledEnd,
      priority: values.priority || null,
      estimatedDays: values.estimatedDays
        ? parseInt(values.estimatedDays, 10)
        : null,
      notes: values.notes || null,
      ownerUnitIds: ownerUnits.map((u) => u.id),
      participatingUnitIds: participUnits.map((u) => u.id),
      contactPointIds: contactPoints.map((c) => c.id),
      auditeeRepIds: auditeeReps.map((c) => c.id),
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
            name="entityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{L.field.entity}</FormLabel>
                <FormControl>
                  <LabeledSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={entityOptions}
                    placeholder="Chọn đối tượng kiểm toán"
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

          <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phạm vi kiểm toán</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Phạm vi kiểm toán..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSection title="Đơn vị & liên hệ">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Đơn vị chủ quản
              </label>
              <SearchableInput
                multiple
                value={ownerUnits}
                onChange={setOwnerUnits}
                options={ownerResults}
                getDisplayValue={(u: OrgUnit) =>
                  u.code ? `${u.name} (${u.code})` : u.name
                }
                onQueryChange={setOwnerQuery}
                placeholder="Tìm đơn vị chủ quản..."
                noResultsText={C.table.noData}
                getParentId={(u: OrgUnit) => u.parentId}
                renderChipLabel={(u: OrgUnit) => (
                  <OrgUnitCardPopover id={u.id}>{u.name}</OrgUnitCardPopover>
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Đơn vị phối hợp
              </label>
              <SearchableInput
                multiple
                value={participUnits}
                onChange={setParticipUnits}
                options={participResults}
                getDisplayValue={(u: OrgUnit) =>
                  u.code ? `${u.name} (${u.code})` : u.name
                }
                onQueryChange={setParticipQuery}
                placeholder="Tìm đơn vị phối hợp..."
                noResultsText={C.table.noData}
                getParentId={(u: OrgUnit) => u.parentId}
                renderChipLabel={(u: OrgUnit) => (
                  <OrgUnitCardPopover id={u.id}>{u.name}</OrgUnitCardPopover>
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Đại diện đơn vị kiểm toán
              </label>
              <ContactSelectorMulti
                value={auditeeReps}
                onChange={setAuditeeReps}
                placeholder="Tìm đại diện..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Đầu mối liên hệ
              </label>
              <ContactSelectorMulti
                value={contactPoints}
                onChange={setContactPoints}
                placeholder="Tìm đầu mối liên hệ..."
              />
            </div>
          </FormSection>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{L.field.notes}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ghi chú, lý do..."
                    rows={2}
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
