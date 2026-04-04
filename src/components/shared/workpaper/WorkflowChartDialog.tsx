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
  subType?: string;
}

export function WorkflowChartDialog({
  open,
  onOpenChange,
  entityType,
  currentStatus,
  subType = "",
}: WorkflowChartDialogProps) {
  const { data: workflows = [] } = useApprovalWorkflows();

  // Find the workflow bound to this entity type + subType, or fall back to default
  const workflow = React.useMemo(() => {
    // 1. Try exact match (entityType + subType)
    const exactMatch = workflows.find((w) =>
      w.entityBindings.some(
        (b) => b.entityType === entityType && b.subType === subType,
      ),
    );
    if (exactMatch) return exactMatch;

    // 2. If subType provided, try base type fallback (entityType + '')
    if (subType) {
      const baseMatch = workflows.find((w) =>
        w.entityBindings.some(
          (b) => b.entityType === entityType && b.subType === "",
        ),
      );
      if (baseMatch) return baseMatch;
    }

    // 3. Fall back to default workflow
    return workflows.find((w) => w.isDefault && w.isActive) ?? null;
  }, [workflows, entityType, subType]);

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
