import { Suspense } from "react";
import { EngagementPageView } from "@/features/engagement/components/EngagementPageView";

export default function EngagementPage() {
  return (
    <Suspense>
      <EngagementPageView />
    </Suspense>
  );
}
