"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSearch } from "@/components/shared/UserSearch";
import { useCreateTeam, useUpdateTeam } from "../hooks/useTeams";
import { TEAMS_LABELS } from "@/constants/labels/teams";
import { Loader2 } from "lucide-react";
import type { Team } from "../types";

const L = TEAMS_LABELS;

const teamFormSchema = z.object({
  name: z.string().min(1, L.VALIDATION_TEAM_NAME_REQUIRED),
  description: z.string().optional(),
  ownerId: z.string().min(1, L.VALIDATION_OWNER_REQUIRED),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

interface TeamFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Team | null;
}

export function TeamForm({ open, onOpenChange, initialData }: TeamFormProps) {
  const isEdit = !!initialData;
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
      ownerId: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description || "",
          ownerId: initialData.owner?.id || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          ownerId: "",
        });
      }
    }
  }, [open, initialData, form]);

  const onSubmit = async (values: TeamFormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            name: values.name,
            description: values.description || null,
            ownerId: values.ownerId,
          },
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
    } catch {
      // handled by mutation
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? L.TEAM_EDIT : L.TEAM_CREATE}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-name">{L.TEAM_NAME} *</Label>
          <Input id="team-name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-desc">{L.TEAM_DESCRIPTION}</Label>
          <Textarea
            id="team-desc"
            rows={3}
            {...form.register("description")}
          />
        </div>

        <div className="space-y-2">
          <Label>{L.TEAM_OWNER} *</Label>
          <UserSearch
            value={form.watch("ownerId") || null}
            onSelect={(id) => form.setValue("ownerId", id || "")}
            placeholder="Chọn trưởng nhóm..."
          />
          {form.formState.errors.ownerId && (
            <p className="text-xs text-destructive">{form.formState.errors.ownerId.message}</p>
          )}
        </div>
      </div>
    </FormDialog>
  );
}
