"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PLAN_LABELS } from "@/constants/labels";
import { useCreatePlan } from "../hooks/usePlans";
import { PlanList } from "./PlanList";
import { PlanDetail } from "./PlanDetail";
import { PlanForm } from "./PlanForm";
import type { PlanSummary, PlanInput } from "../types";

const L = PLAN_LABELS.plan;

export function PlanPageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get("id");

  const [formOpen, setFormOpen] = React.useState(false);

  const createMutation = useCreatePlan();

  const handleSelect = (plan: PlanSummary) => {
    router.push(`/plan?id=${plan.id}`);
  };

  const handleCreate = () => {
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: PlanInput) => {
    try {
      await createMutation.mutateAsync(data);
      setFormOpen(false);
    } catch {
      // Error captured by mutation state
    }
  };

  const handleBack = () => {
    router.push("/plan");
  };

  // If a plan is selected, show detail view
  if (selectedPlanId) {
    return <PlanDetail planId={selectedPlanId} onBack={handleBack} />;
  }

  // Otherwise show list view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{L.title}</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý kế hoạch kiểm toán theo kỳ
        </p>
      </div>

      <PlanList onSelect={handleSelect} onCreate={handleCreate} />

      <PlanForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
