"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import {
  useAvailableTransitions,
  useExecuteTransition,
} from "../../hooks/useEngagements";
import { StatusBadge } from "@/components/shared/workpaper/StatusBadge";

interface WpApprovalBarProps {
  engagementId: string;
  wpApprovalStatus: string;
}

export function WpApprovalBar({
  engagementId,
  wpApprovalStatus,
}: WpApprovalBarProps) {
  const { data: transitions = [], isLoading } = useAvailableTransitions(
    "work_program",
    engagementId,
  );
  const executeMutation = useExecuteTransition();

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5">
      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">
        Trạng thái phê duyệt CTKT:
      </span>
      <StatusBadge status={wpApprovalStatus} />

      {isLoading && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      )}

      <div className="ml-auto flex items-center gap-2">
        {transitions.map((t) => (
          <Button
            key={t.id}
            variant={t.actionType === "approve" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            disabled={executeMutation.isPending}
            onClick={() =>
              executeMutation.mutate({
                entityType: "work_program",
                entityId: engagementId,
                transitionId: t.id,
                engagementId,
              })
            }
          >
            {executeMutation.isPending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : null}
            {t.actionLabel}
          </Button>
        ))}
      </div>
    </div>
  );
}
