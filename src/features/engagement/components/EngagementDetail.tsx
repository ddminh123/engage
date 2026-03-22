"use client";

import * as React from "react";
import { ChevronLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { TeamAvatarManager } from "@/components/shared/TeamAvatarManager";
import { COMMON_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import {
  useEngagement,
  useUpdateEngagement,
  useDeleteEngagement,
  useAddEngagementMember,
  useUpdateEngagementMember,
  useRemoveEngagementMember,
} from "../hooks/useEngagements";
import { EngagementForm } from "./EngagementForm";
import { PlanningTab } from "./tabs/PlanningTab";
import { ExecutionTab } from "./tabs/ExecutionTab";
import { FindingsTab } from "./tabs/FindingsTab";
import { ReportingTab } from "./tabs/ReportingTab";
import type {
  EngagementInput,
  EngagementDetail as EngagementDetailType,
} from "../types";

const C = COMMON_LABELS;
const L = ENGAGEMENT_LABELS.engagement;

const STATUS_OPTIONS = Object.entries(L.status).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-slate-100 text-slate-700",
  fieldwork: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  reporting: "bg-purple-100 text-purple-700",
  closed: "bg-green-100 text-green-700",
};

interface EngagementDetailProps {
  engagementId: string;
  onBack: () => void;
}

export function EngagementDetail({
  engagementId,
  onBack,
}: EngagementDetailProps) {
  const { data: engagement, isLoading } = useEngagement(engagementId);
  const updateMutation = useUpdateEngagement();
  const deleteMutation = useDeleteEngagement();
  const addMember = useAddEngagementMember();
  const updateMemberRole = useUpdateEngagementMember();
  const removeMember = useRemoveEngagementMember();

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (!engagement || newStatus === engagement.status) return;
    updateMutation.mutate({ id: engagementId, data: { status: newStatus } });
  };

  const handleEdit = (data: EngagementInput) => {
    updateMutation.mutate(
      { id: engagementId, data },
      {
        onSuccess: () => setEditOpen(false),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(engagementId, {
      onSuccess: () => onBack(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Không tìm thấy cuộc kiểm toán.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Back nav */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Danh sách cuộc kiểm toán
      </button>

      {/* Header */}
      <div className="flex items-start justify-between pt-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold leading-tight truncate">
              {engagement.title}
            </h1>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[engagement.status] ?? "bg-muted text-muted-foreground"}`}
            >
              {L.status[engagement.status] ?? engagement.status}
            </span>
          </div>
          {/* Team avatars — Jira-style overlapping */}
          <div className="mt-2">
            <TeamAvatarManager
              members={(engagement.members ?? []).map((m) => ({
                userId: m.userId,
                role: m.role,
                user: {
                  id: m.user.id,
                  name: m.user.name,
                  avatarUrl: m.user.avatarUrl,
                  email: m.user.email,
                  title: m.user.title,
                },
              }))}
              onAdd={(userId, role) =>
                addMember.mutate({
                  engagementId: engagement.id,
                  data: { userId, role },
                })
              }
              onUpdateRole={(userId, role) =>
                updateMemberRole.mutate({
                  engagementId: engagement.id,
                  userId,
                  data: { role },
                })
              }
              onRemove={(userId) =>
                removeMember.mutate({ engagementId: engagement.id, userId })
              }
            />
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            {engagement.entity && (
              <span>
                {engagement.entity.name}
                {engagement.entity.entityType && (
                  <span className="ml-1 text-xs">
                    ({engagement.entity.entityType.name})
                  </span>
                )}
              </span>
            )}
            <span>·</span>
            <span>
              {new Date(engagement.startDate).toLocaleDateString("vi-VN")} —{" "}
              {new Date(engagement.endDate).toLocaleDateString("vi-VN")}
            </span>
            {engagement.priority && (
              <>
                <span>·</span>
                <Badge
                  variant={
                    engagement.priority === "high"
                      ? "destructive"
                      : engagement.priority === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {L.priority[engagement.priority] ?? engagement.priority}
                </Badge>
              </>
            )}
            {engagement.plannedAudit?.plan && (
              <>
                <span>·</span>
                <span className="text-xs">
                  KH: {engagement.plannedAudit.plan.title}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="ml-4 flex shrink-0 items-center gap-2">
          <div onClick={(e) => e.stopPropagation()}>
            <LabeledSelect
              value={engagement.status}
              onChange={handleStatusChange}
              options={STATUS_OPTIONS}
              placeholder="Trạng thái"
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {C.action.edit}
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="h-auto p-0 text-destructive hover:text-destructive/80"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Separator className="mt-4 mb-0" />

      {/* Tabs workspace */}
      <Tabs defaultValue="planning" className="pt-2">
        <TabsList className="h-10">
          <TabsTrigger value="planning" className="px-4 text-[15px]">
            {L.tab.planning}
          </TabsTrigger>
          <TabsTrigger value="execution" className="px-4 text-[15px]">
            {L.tab.execution}
          </TabsTrigger>
          <TabsTrigger value="findings" className="px-4 text-[15px]">
            {L.tab.findings}
          </TabsTrigger>
          <TabsTrigger value="reporting" className="px-4 text-[15px]">
            {L.tab.reporting}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planning" className="mt-4">
          <PlanningTab engagement={engagement} />
        </TabsContent>

        <TabsContent value="execution" className="mt-4">
          <ExecutionTab engagement={engagement} />
        </TabsContent>

        <TabsContent value="findings" className="mt-4">
          <FindingsTab engagement={engagement} />
        </TabsContent>

        <TabsContent value="reporting" className="mt-4">
          <ReportingTab engagement={engagement} />
        </TabsContent>
      </Tabs>

      {/* Edit form */}
      <EngagementForm
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={engagement as any}
        onSubmit={handleEdit}
        isLoading={updateMutation.isPending}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={L.deleteTitle}
        description={L.deleteDescription(engagement.title)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
