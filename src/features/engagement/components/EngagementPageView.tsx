"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { useCreateEngagement } from "../hooks/useEngagements";
import { EngagementList } from "./EngagementList";
import { EngagementDetail } from "./EngagementDetail";
import { EngagementForm } from "./EngagementForm";
import type { EngagementInput, EngagementSummary } from "../types";

const L = ENGAGEMENT_LABELS.engagement;

export function EngagementPageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
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
