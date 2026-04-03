import { Suspense } from "react";
import { PlanPageView } from "@/features/plan/components/PlanPageView";

export default function PlanPage() {
  return (
    <Suspense>
      <PlanPageView />
    </Suspense>
  );
}
