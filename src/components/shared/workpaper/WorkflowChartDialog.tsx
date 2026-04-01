"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkflowFlowChart } from "@/components/shared/WorkflowFlowChart";
import { useApprovalWorkflows } from "@/features/settings/hooks/useApprovalWorkflows";

interface WorkflowChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  currentStatus: string;
}

export function WorkflowChartDialog({
  open,
  onOpenChange,
  entityType,
  currentStatus,
}: WorkflowChartDialogProps) {
  const { data: workflows = [] } = useApprovalWorkflows();

  // Find the workflow bound to this entity type, or fall back to default
  const workflow = React.useMemo(() => {
    const bound = workflows.find((w) =>
      w.entityBindings.some((b) => b.entityType === entityType),
    );
    if (bound) return bound;
    return workflows.find((w) => w.isDefault && w.isActive) ?? null;
  }, [workflows, entityType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Quy trình phê duyệt</DialogTitle>
          <DialogDescription>
            {workflow?.name ?? "Không tìm thấy quy trình"}
          </DialogDescription>
        </DialogHeader>
        {workflow ? (
          <WorkflowFlowChart
            transitions={workflow.transitions}
            highlightStatus={currentStatus}
            showLabel={false}
          />
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Chưa có quy trình nào được gán cho loại thực thể này.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
