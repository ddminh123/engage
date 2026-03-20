"use client";

import * as React from "react";
import { Plus, Search, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_LABELS } from "@/constants/labels";
import { usePlans } from "../hooks/usePlans";
import type { PlanSummary } from "../types";

const L = PLAN_LABELS.plan;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  approved: "default",
  in_progress: "secondary",
  closed: "outline",
};

interface PlanListProps {
  onSelect: (plan: PlanSummary) => void;
  onCreate: () => void;
}

export function PlanList({ onSelect, onCreate }: PlanListProps) {
  const [search, setSearch] = React.useState("");
  const { data: plans = [], isLoading } = usePlans();

  const filtered = React.useMemo(() => {
    const sorted = [...plans].sort(
      (a, b) =>
        new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime(),
    );
    if (!search) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((p) => p.title.toLowerCase().includes(q));
  }, [plans, search]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={L.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {L.createTitle}
        </Button>
      </div>

      {/* Cards */}
      {isLoading ? (
        <p className="py-8 text-center text-muted-foreground">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{L.noData}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plan) => {
            const pct =
              plan.auditCount > 0
                ? Math.round((plan.completedCount / plan.auditCount) * 100)
                : 0;
            return (
              <Card
                key={plan.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => onSelect(plan)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {plan.title}
                    </CardTitle>
                    <Badge variant={STATUS_VARIANT[plan.status] ?? "secondary"}>
                      {L.status[plan.status] ?? plan.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {L.periodType[plan.periodType] ?? plan.periodType} ·{" "}
                    {new Date(plan.periodStart).toLocaleDateString("vi-VN")} —{" "}
                    {new Date(plan.periodEnd).toLocaleDateString("vi-VN")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {plan.auditCount} kế hoạch cuộc kiểm toán
                    </span>
                    {plan.auditCount > 0 && (
                      <span className="font-medium">
                        {plan.completedCount}/{plan.auditCount} ({pct}%)
                      </span>
                    )}
                  </div>
                  {plan.auditCount > 0 && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
