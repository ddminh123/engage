"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { EngagementDetail } from "../../types";

// Lazy load tab components
const OverviewTab = React.lazy(() =>
  import("../tabs/OverviewTab").then((m) => ({ default: m.OverviewTab })),
);
const PlanningTab = React.lazy(() =>
  import("../tabs/PlanningTab").then((m) => ({ default: m.PlanningTab })),
);
const ExecutionTab = React.lazy(() =>
  import("../tabs/ExecutionTab").then((m) => ({ default: m.ExecutionTab })),
);
const FindingsTab = React.lazy(() =>
  import("../tabs/FindingsTab").then((m) => ({ default: m.FindingsTab })),
);
const ReportingTab = React.lazy(() =>
  import("../tabs/ReportingTab").then((m) => ({ default: m.ReportingTab })),
);

interface EngagementTabRouterProps {
  engagement: EngagementDetail;
  onOpenWorkpaper?: (procedureId: string) => void;
}

export function EngagementTabRouter({
  engagement,
  onOpenWorkpaper,
}: EngagementTabRouterProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const section = searchParams.get("section") ?? undefined;

  const fallback = (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <React.Suspense fallback={fallback}>
      {!tab && <OverviewTab engagement={engagement} />}
      {tab === "planning" && (
        <PlanningTab
          engagement={engagement}
          section={section}
          onOpenWorkpaper={onOpenWorkpaper}
        />
      )}
      {tab === "execution" && (
        <ExecutionTab
          engagement={engagement}
          onOpenWorkpaper={onOpenWorkpaper}
        />
      )}
      {tab === "findings" && <FindingsTab engagement={engagement} />}
      {tab === "reporting" && <ReportingTab engagement={engagement} />}
    </React.Suspense>
  );
}
