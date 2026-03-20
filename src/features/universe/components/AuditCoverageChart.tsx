"use client";

import { useMemo } from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useEntities } from "../hooks/useEntities";

const chartConfig = {
  audited: { label: "Đã kiểm toán", color: "#10b981" },
  notAudited: { label: "Chưa kiểm toán", color: "#e5e7eb" },
} satisfies ChartConfig;

export function AuditCoverageChart() {
  const { data: entities = [] } = useEntities();

  const { auditedCount, totalHighCritical, percentage } = useMemo(() => {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Filter high/critical inherent risk entities
    const highCritical = entities.filter(
      (e) =>
        e.latestInherentLevel === "High" ||
        e.latestInherentLevel === "Critical",
    );

    // Count those audited in last 12 months
    const audited = highCritical.filter((e) => {
      if (!e.lastAuditedAt) return false;
      const auditDate = new Date(e.lastAuditedAt);
      return auditDate >= twelveMonthsAgo;
    });

    const total = highCritical.length;
    const count = audited.length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    return { auditedCount: count, totalHighCritical: total, percentage: pct };
  }, [entities]);

  // Don't render if no high/critical entities
  if (totalHighCritical === 0) return null;

  const chartData = [
    {
      name: "coverage",
      value: percentage,
      fill: chartConfig.audited.color,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium">Độ phủ kiểm toán</CardTitle>
        <CardDescription className="text-xs">
          % đối tượng rủi ro Cao/Rất cao được kiểm toán trong 12 tháng qua
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[160px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius={60}
            outerRadius={80}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              dataKey="value"
              background={{ fill: "#e5e7eb" }}
              cornerRadius={10}
              angleAxisId={0}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-2xl font-bold"
              style={{ fontSize: 24, fontWeight: 700 }}
            >
              {percentage}%
            </text>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
