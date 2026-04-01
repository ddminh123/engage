"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2, MoreHorizontal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TeamAvatarManager } from "@/components/shared/TeamAvatarManager";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EngagementForm } from "../EngagementForm";
import { COMMON_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import {
  useUpdateEngagement,
  useDeleteEngagement,
  useAddEngagementMember,
  useUpdateEngagementMember,
  useRemoveEngagementMember,
} from "../../hooks/useEngagements";
import { usePlanningSteps } from "@/features/settings/hooks/usePlanningSteps";
import type { EngagementDetail, EngagementInput } from "../../types";

const C = COMMON_LABELS;
const L = ENGAGEMENT_LABELS.engagement;

// Tab labels map
const TAB_LABELS: Record<string, string> = {
  planning: L.tab.planning,
  execution: L.tab.execution,
  findings: L.tab.findings,
  reporting: L.tab.reporting,
};

interface EngagementHeaderProps {
  engagement: EngagementDetail;
}

export function EngagementHeader({ engagement }: EngagementHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateMutation = useUpdateEngagement();
  const deleteMutation = useDeleteEngagement();
  const addMember = useAddEngagementMember();
  const updateMemberRole = useUpdateEngagementMember();
  const removeMember = useRemoveEngagementMember();

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // Get current tab and section from URL
  const currentTab = searchParams.get("tab");
  const currentSection = searchParams.get("section");

  // Fetch planning steps for section title lookup
  const { data: stepConfigs } = usePlanningSteps();
  const sectionTitle = React.useMemo(() => {
    if (!currentSection || !stepConfigs) return null;
    const step = stepConfigs.find((s) => s.key === currentSection);
    return step?.title ?? null;
  }, [currentSection, stepConfigs]);

  const handleEdit = (data: EngagementInput) => {
    updateMutation.mutate(
      { id: engagement.id, data },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(engagement.id, {
      onSuccess: () => router.push("/engagement"),
    });
  };

  return (
    <>
      <div className="sticky top-16 z-40 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            {currentTab ? (
              <>
                <Link
                  href={`/engagement/${engagement.id}`}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate shrink min-w-0"
                  style={{ maxWidth: "40vw" }}
                >
                  {engagement.title}
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                {sectionTitle ? (
                  <>
                    <Link
                      href={`/engagement/${engagement.id}?tab=${currentTab}`}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      {TAB_LABELS[currentTab] ?? currentTab}
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate min-w-0">
                      {sectionTitle}
                    </span>
                  </>
                ) : (
                  <span className="font-medium shrink-0">
                    {TAB_LABELS[currentTab] ?? currentTab}
                  </span>
                )}
              </>
            ) : (
              <span
                className="truncate font-medium min-w-0"
                style={{ maxWidth: "50vw" }}
              >
                {engagement.title}
              </span>
            )}
          </nav>

          {/* Right: Team + Status + Actions */}
          <div className="flex items-center gap-3">
            {/* Team Avatars */}
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

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" />}
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {C.action.edit}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {C.action.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EngagementForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEdit}
        isLoading={updateMutation.isPending}
        initialData={{
          ...engagement,
          counts: { sections: 0, procedures: 0, findings: 0 },
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa cuộc kiểm toán "${engagement.title}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
