"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { EngagementDetail } from "../../types";

interface ReportingTabProps {
  engagement: EngagementDetail;
}

export function ReportingTab({ engagement }: ReportingTabProps) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-muted-foreground">
        Chức năng báo cáo đang được phát triển.
      </CardContent>
    </Card>
  );
}
