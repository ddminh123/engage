"use client";

import React, { useMemo } from "react";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { WorkProgramV2 } from "../work-program";
import { useSyncPlanningToExecution } from "../../hooks/useEngagements";
import type { EngagementDetail } from "../../types";

interface ExecutionTabProps {
  engagement: EngagementDetail;
  onOpenWorkpaper?: (procedureId: string) => void;
}

export function ExecutionTab({
  engagement,
  onOpenWorkpaper,
}: ExecutionTabProps) {
  const syncMutation = useSyncPlanningToExecution();
  const [syncResult, setSyncResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Filter to execution-phase items only
  const execSections = useMemo(
    () => engagement.sections.filter((s) => s.phase === "execution"),
    [engagement.sections],
  );
  const execObjectives = useMemo(
    () =>
      (engagement.standaloneObjectives ?? []).filter(
        (o) => o.phase === "execution",
      ),
    [engagement.standaloneObjectives],
  );
  const execProcedures = useMemo(
    () =>
      (engagement.ungroupedProcedures ?? []).filter(
        (p) => p.addedFrom === "execution",
      ),
    [engagement.ungroupedProcedures],
  );

  const hasExecutionItems =
    execSections.length > 0 ||
    execObjectives.length > 0 ||
    execProcedures.length > 0;

  return (
    <div className="space-y-3">
      {/* Sync from planning button */}
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            syncMutation.mutate(engagement.id, {
              onSuccess: (data) => {
                if (
                  data.createdSections +
                    data.createdObjectives +
                    data.createdProcedures ===
                  0
                ) {
                  setSyncResult({
                    success: true,
                    message:
                      "Tất cả mục kế hoạch đã được đồng bộ sang thực hiện.",
                  });
                } else {
                  setSyncResult({
                    success: true,
                    message: `Đã tạo ${data.createdSections} phần hành, ${data.createdObjectives} mục tiêu và ${data.createdProcedures} thủ tục từ kế hoạch.`,
                  });
                }
              },
              onError: () => {
                setSyncResult({
                  success: false,
                  message: "Lỗi khi đồng bộ từ kế hoạch sang thực hiện.",
                });
              },
            });
          }}
          disabled={syncMutation.isPending}
        >
          <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" />
          {syncMutation.isPending ? "Đang đồng bộ..." : "Đồng bộ từ Kế hoạch"}
        </Button>
      </div>

      {!hasExecutionItems && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu thực hiện. Nhấn &quot;Đồng bộ từ Kế hoạch&quot; để sao
          chép chương trình kiểm toán từ giai đoạn lập kế hoạch.
        </p>
      )}

      {hasExecutionItems && (
        <WorkProgramV2
          engagementId={engagement.id}
          sections={execSections}
          standaloneObjectives={execObjectives}
          standaloneProcedures={execProcedures}
          findingCount={engagement.findings?.length ?? 0}
          mode="execution"
          members={engagement.members}
          onOpenWorkpaper={onOpenWorkpaper}
        />
      )}

      <ConfirmDialog
        open={!!syncResult}
        onOpenChange={(open) => {
          if (!open) setSyncResult(null);
        }}
        title={syncResult?.success ? "Thành công" : "Lỗi"}
        description={syncResult?.message ?? ""}
        onConfirm={() => setSyncResult(null)}
        variant={syncResult?.success ? "info" : "destructive"}
      />
    </div>
  );
}
