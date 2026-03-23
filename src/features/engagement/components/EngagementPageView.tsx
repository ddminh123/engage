"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import {
  useCreateEngagement,
  useEngagement,
  useWpAssignments,
  useAddWpAssignment,
  useRemoveWpAssignment,
} from "../hooks/useEngagements";
import { Loader2 } from "lucide-react";
import { EngagementList } from "./EngagementList";
import { EngagementDetail } from "./EngagementDetail";
import { EngagementForm } from "./EngagementForm";
import { ProcedureWorkpaper } from "./work-program/ProcedureWorkpaper";
import type {
  EngagementInput,
  EngagementSummary,
  EngagementProcedure,
} from "../types";
import type { MultiSelectOption } from "@/components/shared/MultiSelectCommand";

const L = ENGAGEMENT_LABELS.engagement;

export function EngagementPageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const wpId = searchParams.get("wp");
  const isCreateFromPlan = searchParams.get("create") === "1";

  const [formOpen, setFormOpen] = React.useState(false);

  const createMutation = useCreateEngagement();

  // Auto-open create form when navigating from Plan module
  React.useEffect(() => {
    if (isCreateFromPlan) {
      setFormOpen(true);
    }
  }, [isCreateFromPlan]);

  // Build pre-fill data from URL params (from Plan → Create Engagement)
  const prefillData = React.useMemo(() => {
    if (!isCreateFromPlan) return undefined;
    const title = searchParams.get("title");
    const entityId = searchParams.get("entityId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const priority = searchParams.get("priority");
    const objective = searchParams.get("objective");
    const plannedAuditId = searchParams.get("plannedAuditId");
    if (!entityId || !startDate || !endDate) return undefined;
    return {
      id: "",
      title: title || "",
      entityId,
      plannedAuditId: plannedAuditId || null,
      status: "planning",
      objective: objective || null,
      startDate,
      endDate,
      estimatedDays: null,
      priority: priority || null,
      createdAt: "",
      updatedAt: "",
      entity: null,
      plannedAudit: null,
      counts: { sections: 0, procedures: 0, findings: 0 },
    };
  }, [isCreateFromPlan, searchParams]);

  const handleSelect = (engagement: EngagementSummary) => {
    router.push(`/engagement?id=${engagement.id}`);
  };

  const handleCreate = () => {
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open && isCreateFromPlan) {
      // Clear the create params from URL when closing
      router.replace("/engagement");
    }
  };

  const handleFormSubmit = async (data: EngagementInput) => {
    try {
      const result = await createMutation.mutateAsync(data);
      setFormOpen(false);
      router.push(`/engagement?id=${result.id}`);
    } catch {
      // Error captured by mutation state
    }
  };

  const handleBack = () => {
    router.push("/engagement");
  };

  // If a workpaper is selected, show workpaper view
  if (selectedId && wpId) {
    return (
      <WorkpaperView
        engagementId={selectedId}
        procedureId={wpId}
        onBack={() => router.push(`/engagement?id=${selectedId}`)}
      />
    );
  }

  // If an engagement is selected, show detail view
  if (selectedId) {
    return <EngagementDetail engagementId={selectedId} onBack={handleBack} />;
  }

  // Otherwise show list view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{L.title}</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý cuộc kiểm toán và chương trình kiểm toán
        </p>
      </div>

      <EngagementList onSelect={handleSelect} onCreate={handleCreate} />

      <EngagementForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending}
        prefillData={prefillData ?? undefined}
      />
    </div>
  );
}

// ── WorkpaperView: fetches engagement + renders ProcedureWorkpaper ──

function WorkpaperView({
  engagementId,
  procedureId,
  onBack,
}: {
  engagementId: string;
  procedureId: string;
  onBack: () => void;
}) {
  const { data: engagement, isLoading } = useEngagement(engagementId);
  const { data: wpAssignments = [] } = useWpAssignments(engagementId);
  const addAssignment = useAddWpAssignment();
  const removeAssignment = useRemoveWpAssignment();

  // Find procedure from engagement data
  const procedure = React.useMemo<EngagementProcedure | null>(() => {
    if (!engagement) return null;
    // Search in sections → objectives → procedures, sections → procedures, standalone objectives → procedures
    for (const sec of engagement.sections) {
      for (const proc of sec.procedures) {
        if (proc.id === procedureId) return proc;
      }
      for (const obj of sec.objectives) {
        for (const proc of obj.procedures) {
          if (proc.id === procedureId) return proc;
        }
      }
    }
    for (const obj of engagement.standaloneObjectives ?? []) {
      for (const proc of obj.procedures) {
        if (proc.id === procedureId) return proc;
      }
    }
    for (const proc of engagement.ungroupedProcedures ?? []) {
      if (proc.id === procedureId) return proc;
    }
    return null;
  }, [engagement, procedureId]);

  // Build RCM reference options from engagement risks
  const controlOptions = React.useMemo<MultiSelectOption[]>(() => {
    if (!engagement) return [];
    const controls: MultiSelectOption[] = [];
    for (const risk of engagement.risks ?? []) {
      for (const ctrl of risk.controls ?? []) {
        controls.push({ value: ctrl.id, label: ctrl.description ?? ctrl.id });
      }
    }
    return controls;
  }, [engagement]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!engagement || !procedure) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Không tìm thấy thủ tục.
      </div>
    );
  }

  return (
    <ProcedureWorkpaper
      procedure={procedure}
      engagementId={engagementId}
      onBack={onBack}
      controlOptions={controlOptions}
      members={engagement.members ?? []}
      wpAssignments={wpAssignments}
      onAssign={(entityType, entityId, userId) =>
        addAssignment.mutate({
          engagementId,
          entityType,
          entityId,
          userIds: [userId],
        })
      }
      onUnassign={(entityType, entityId, userId) =>
        removeAssignment.mutate({
          engagementId,
          entityType,
          entityId,
          userId,
        })
      }
    />
  );
}
