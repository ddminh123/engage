"use client";

import { useMemo } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UNIVERSE_LABELS } from "@/constants/labels";
import { useEntities } from "../hooks/useEntities";

const L = UNIVERSE_LABELS.entity;

// IIA 5×5 risk matrix color scheme
// Score = impact × likelihood → level color
const COLORS: Record<string, string> = {
  Low: "#10b981", // emerald-500
  Medium: "#f59e0b", // amber-500
  High: "#f97316", // orange-500
  Critical: "#dc2626", // red-600
};

function riskLevel(score: number): string {
  if (score <= 4) return "Low";
  if (score <= 9) return "Medium";
  if (score <= 16) return "High";
  return "Critical";
}

function scoreColor(score: number): string {
  return COLORS[riskLevel(score)] ?? COLORS.Medium;
}

const IMPACT_LABELS = ["1", "2", "3", "4", "5"];
const LIKELIHOOD_LABELS = ["5", "4", "3", "2", "1"];

export function RiskHeatmap() {
  const { data: entities = [] } = useEntities();

  const { data, maxCount } = useMemo(() => {
    // Build a 5×5 count matrix: counts[likelihood][impact]
    const counts: number[][] = Array.from({ length: 5 }, () =>
      Array(5).fill(0),
    );

    for (const e of entities) {
      const impact = e.latestInherentImpact;
      const likelihood = e.latestInherentLikelihood;
      if (
        impact != null &&
        likelihood != null &&
        impact >= 1 &&
        impact <= 5 &&
        likelihood >= 1 &&
        likelihood <= 5
      ) {
        counts[likelihood - 1][impact - 1]++;
      }
    }

    let max = 0;

    // Nivo heatmap data format: rows = likelihood (5→1, top-to-bottom)
    const heatmapData = LIKELIHOOD_LABELS.map((lLabel) => {
      const lIdx = parseInt(lLabel) - 1; // 0-based
      return {
        id: lLabel,
        data: IMPACT_LABELS.map((iLabel) => {
          const iIdx = parseInt(iLabel) - 1;
          const count = counts[lIdx][iIdx];
          if (count > max) max = count;
          return {
            x: iLabel,
            y: count,
          };
        }),
      };
    });

    return { data: heatmapData, maxCount: max };
  }, [entities]);

  const hasData = entities.some(
    (e) => e.latestInherentImpact != null && e.latestInherentLikelihood != null,
  );

  if (!hasData) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Ma trận rủi ro tiềm tàng
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex gap-1">
          {/* Y-axis label — centered on grid area (excluding bottom axis 28px) */}
          <div
            className="flex shrink-0 items-center"
            style={{ paddingBottom: 28 }}
          >
            <span
              className="text-[10px] text-muted-foreground"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              {L.field.inherentLikelihood}
            </span>
          </div>
          {/* Chart area */}
          <div className="flex-1">
            <div style={{ height: 200 }}>
              <ResponsiveHeatMap
                data={data}
                margin={{ top: 4, right: 4, bottom: 28, left: 20 }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 6,
                  legend: L.field.inherentImpact,
                  legendPosition: "middle" as const,
                  legendOffset: 24,
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 6,
                }}
                colors={(cell) => {
                  const impact = parseInt(cell.data.x as string);
                  const likelihood = parseInt(cell.serieId as string);
                  return scoreColor(impact * likelihood);
                }}
                opacity={1}
                borderRadius={4}
                borderWidth={2}
                borderColor="hsl(0 0% 100%)"
                enableLabels={false}
                layers={[
                  "grid",
                  "axes",
                  "cells",
                  // Custom layer: circle badges for counts
                  (ctx) => {
                    return (
                      <g>
                        {ctx.cells.map((cell) => {
                          if (!cell.value) return null;
                          const r = 12;
                          return (
                            <g
                              key={`${cell.serieId}-${cell.data.x}`}
                              transform={`translate(${cell.x}, ${cell.y})`}
                            >
                              <circle r={r} fill="rgba(255,255,255,0.85)" />
                              <text
                                textAnchor="middle"
                                dominantBaseline="central"
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  fill: "hsl(0 0% 20%)",
                                  fontFamily:
                                    "var(--font-sans), Inter, system-ui, sans-serif",
                                }}
                              >
                                {cell.value}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  },
                  "annotations",
                ]}
                hoverTarget="cell"
                tooltip={({ cell }) => (
                  <div className="whitespace-nowrap rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md">
                    <span>
                      Tác động: <strong>{cell.data.x}</strong> × Khả năng:{" "}
                      <strong>{cell.serieId}</strong>
                    </span>
                    <span className="ml-2">
                      — <strong>{cell.value ?? 0}</strong> đối tượng
                    </span>
                  </div>
                )}
                theme={{
                  text: {
                    fontFamily:
                      "var(--font-sans), Inter, system-ui, sans-serif",
                    fontSize: 11,
                    fill: "hsl(0 0% 45%)",
                  },
                  axis: {
                    ticks: {
                      text: {
                        fontSize: 11,
                        fill: "hsl(0 0% 45%)",
                      },
                    },
                    legend: {
                      text: {
                        fontSize: 10,
                        fill: "hsl(0 0% 45%)",
                        fontWeight: 500,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
