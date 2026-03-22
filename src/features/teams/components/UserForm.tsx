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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSearch } from "@/components/shared/UserSearch";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { TEAMS_LABELS, USER_ROLE_OPTIONS } from "@/constants/labels/teams";
import { Loader2 } from "lucide-react";
import type { User } from "../types";

const L = TEAMS_LABELS;

const userFormSchema = z.object({
  name: z.string().min(1, L.VALIDATION_NAME_REQUIRED),
  email: z.email(L.VALIDATION_EMAIL_INVALID),
  password: z.string().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  role: z.enum(["cae", "admin", "team_owner", "member"]),
  supervisorId: z.string().nullable().optional(),
  description: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: User | null;
}

export function UserForm({ open, onOpenChange, initialData }: UserFormProps) {
  const isEdit = !!initialData;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      title: "",
      role: "member",
      supervisorId: null,
      description: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          email: initialData.email,
          password: "",
          phone: initialData.phone || "",
          title: initialData.title || "",
          role: initialData.role as UserFormValues["role"],
          supervisorId: initialData.supervisorId || null,
          description: initialData.description || "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          password: "",
          phone: "",
          title: "",
          role: "member",
          supervisorId: null,
          description: "",
        });
      }
    }
  }, [open, initialData, form]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit) {
        const data: Record<string, unknown> = { ...values };
        if (!values.password) delete data.password;
        data.supervisorId = values.supervisorId || null;
        await updateMutation.mutateAsync({ id: initialData.id, data });
      } else {
        if (!values.password) {
          form.setError("password", { message: L.VALIDATION_PASSWORD_REQUIRED });
          return;
        }
        await createMutation.mutateAsync({
          ...values,
          password: values.password,
          supervisorId: values.supervisorId || undefined,
        });
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
      title={isEdit ? L.USER_EDIT : L.USER_CREATE}
      size="md"
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">{L.USER_NAME} *</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{L.USER_EMAIL} *</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              {L.USER_PASSWORD} {!isEdit && "*"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isEdit ? "Để trống nếu không đổi" : ""}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{L.USER_PHONE}</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">{L.USER_TITLE}</Label>
            <Input id="title" {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label>{L.USER_ROLE} *</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(v) => form.setValue("role", v as UserFormValues["role"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{L.USER_SUPERVISOR}</Label>
          <UserSearch
            value={form.watch("supervisorId")}
            onSelect={(id) => form.setValue("supervisorId", id)}
            placeholder="Chọn người giám sát..."
            excludeIds={initialData ? [initialData.id] : []}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{L.USER_DESCRIPTION}</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Ghi chú cá nhân..."
            {...form.register("description")}
          />
        </div>
      </div>
    </FormDialog>
  );
}
