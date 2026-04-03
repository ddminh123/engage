"use client";

import React from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import {
  useAvailableTransitions,
  useExecuteTransition,
} from "../../hooks/useEngagements";
import { StatusBadge } from "@/components/shared/workpaper/StatusBadge";
import { WorkpaperActions } from "@/components/shared/workpaper/WorkpaperActions";
import { WorkflowChartDialog } from "@/components/shared/workpaper/WorkflowChartDialog";
import type { EngagementMember } from "../../types";

interface WpApprovalBarProps {
  engagementId: string;
  wpApprovalStatus: string;
  members?: EngagementMember[];
}

export function WpApprovalBar({
  engagementId,
  wpApprovalStatus,
  members = [],
}: WpApprovalBarProps) {
  const [workflowChartOpen, setWorkflowChartOpen] = React.useState(false);
  const { data: transitions = [], isLoading } = useAvailableTransitions(
    "work_program",
    engagementId,
  );
  const executeMutation = useExecuteTransition();

  const handleTransition = async (
    transitionId: string,
    comment?: string,
    nextAssigneeId?: string,
  ) => {
    try {
      await executeMutation.mutateAsync({
        entityType: "work_program",
        entityId: engagementId,
        transitionId,
        engagementId,
        comment,
        nextAssigneeId,
      });
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Trạng thái phê duyệt CTKT:
        </span>
        <StatusBadge status={wpApprovalStatus} />

        {isLoading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}

        <div className="ml-auto">
          <WorkpaperActions
            transitions={transitions}
            onTransition={handleTransition}
            isTransitioning={executeMutation.isPending}
            onViewWorkflow={() => setWorkflowChartOpen(true)}
            members={members}
          />
        </div>
      </div>
      <WorkflowChartDialog
        open={workflowChartOpen}
        onOpenChange={setWorkflowChartOpen}
        entityType="work_program"
        currentStatus={wpApprovalStatus}
      />
    </>
  );
}
