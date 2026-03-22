"use client";

import { WorkProgramV2 } from "../work-program";
import type { EngagementDetail } from "../../types";

interface ExecutionTabProps {
  engagement: EngagementDetail;
}

export function ExecutionTab({ engagement }: ExecutionTabProps) {
  return (
    <WorkProgramV2
      engagementId={engagement.id}
      sections={engagement.sections}
      standaloneObjectives={engagement.standaloneObjectives}
      findingCount={engagement.findings?.length ?? 0}
      mode="execution"
      members={engagement.members}
    />
  );
}
