"use client";

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { UNIVERSE_LABELS } from "@/constants/labels";
import { useEntities } from "../hooks/useEntities";

const L = UNIVERSE_LABELS.entity;

const LEVELS = ["Low", "Medium", "High", "Critical"] as const;

const LEVEL_COLORS: Record<string, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#dc2626",
};

const chartConfig = {
  count: { label: "Số đối tượng" },
  Low: { label: L.riskLevel.Low, color: LEVEL_COLORS.Low },
  Medium: { label: L.riskLevel.Medium, color: LEVEL_COLORS.Medium },
  High: { label: L.riskLevel.High, color: LEVEL_COLORS.High },
  Critical: { label: L.riskLevel.Critical, color: LEVEL_COLORS.Critical },
} satisfies ChartConfig;

export function ResidualRiskChart() {
  const { data: entities = [] } = useEntities();

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };

    for (const e of entities) {
      const level = e.latestResidualLevel;
      if (level && level in counts) {
        counts[level]++;
      }
    }

    return LEVELS.map((level) => ({
      level,
      label: L.riskLevel[level],
      count: counts[level],
      fill: LEVEL_COLORS[level],
    }));
  }, [entities]);

  const hasData = chartData.some((d) => d.count > 0);

  if (!hasData) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Phân bổ rủi ro còn lại
        </CardTitle>
        <CardDescription className="text-xs">
          Số đối tượng theo mức rủi ro sau kiểm soát
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
          >
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={80}
              tick={{ fontSize: 12 }}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
              {chartData.map((entry) => (
                <Cell key={entry.level} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
