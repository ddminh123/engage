"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_LABELS } from "@/constants/labels";
import type { PlannedAudit } from "../types";

const L = PLAN_LABELS.audit;

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-muted-foreground/30",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
  deferred: "bg-amber-400",
  cancelled: "bg-red-400",
};

interface ScheduleChartProps {
  audits: PlannedAudit[];
  periodStart: string;
  periodEnd: string;
}

/** Parse "YYYY-MM-DD" as local midnight (avoids UTC shift) */
function toLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ScheduleChart({
  audits,
  periodStart,
  periodEnd,
}: ScheduleChartProps) {
  const sortedAudits = React.useMemo(
    () =>
      [...audits].sort(
        (a, b) =>
          toLocal(a.scheduledStart).getTime() -
          toLocal(b.scheduledStart).getTime(),
      ),
    [audits],
  );

  const pStart = toLocal(periodStart).getTime();
  const pEnd = toLocal(periodEnd).getTime();
  const totalMs = pEnd - pStart;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const todayPct =
    todayMs >= pStart && todayMs <= pEnd
      ? ((todayMs - pStart) / totalMs) * 100
      : null;

  // Generate month markers
  const months = React.useMemo(() => {
    const result: { label: string; pct: number }[] = [];
    const start = toLocal(periodStart);
    const end = toLocal(periodEnd);
    const d = new Date(start.getFullYear(), start.getMonth(), 1);

    while (d <= end) {
      const ms = d.getTime();
      if (ms >= pStart && ms <= pEnd) {
        const pct = ((ms - pStart) / totalMs) * 100;
        result.push({
          label: d.toLocaleDateString("vi-VN", {
            month: "short",
            year:
              d.getFullYear() !== start.getFullYear() ? "numeric" : undefined,
          }),
          pct,
        });
      }
      d.setMonth(d.getMonth() + 1);
    }
    return result;
  }, [periodStart, periodEnd, pStart, pEnd, totalMs]);

  if (audits.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Lịch trình kiểm toán
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden pb-4">
        <div
          className="grid"
          style={{ gridTemplateColumns: "minmax(0, 30%) minmax(0, 70%)" }}
        >
          {/* Month header: empty label cell + months */}
          <div />
          <div className="relative mb-1 h-5 overflow-visible">
            {months.map((m, i) => (
              <span
                key={i}
                className="absolute bottom-0 text-[10px] text-muted-foreground whitespace-nowrap"
                style={{
                  left: `${m.pct}%`,
                  transform:
                    i === 0
                      ? "none"
                      : i === months.length - 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Audit rows */}
          {sortedAudits.map((audit) => {
            const name = audit.title || audit.entity?.name || "—";
            const aStart = toLocal(audit.scheduledStart).getTime();
            const aEnd = toLocal(audit.scheduledEnd).getTime();
            const left = Math.max(0, ((aStart - pStart) / totalMs) * 100);
            const right = Math.min(100, ((aEnd - pStart) / totalMs) * 100);
            const width = Math.max(1, right - left);
            const statusLabel = L.status[audit.status] ?? audit.status;

            return (
              <React.Fragment key={audit.id}>
                {/* Label */}
                <div
                  className="flex h-6 items-center pr-2 text-xs"
                  title={name}
                >
                  <span className="truncate">{name}</span>
                </div>
                {/* Bar */}
                <div className="relative h-6">
                  {/* Grid lines */}
                  {months.map((m, mi) => (
                    <div
                      key={mi}
                      className="absolute top-0 bottom-0 border-l border-dashed border-border/40"
                      style={{ left: `${m.pct}%` }}
                    />
                  ))}
                  {/* Today line */}
                  {todayPct !== null && (
                    <div
                      className="absolute top-0 bottom-0 z-10 border-l-2 border-dashed border-red-500"
                      style={{ left: `${todayPct}%` }}
                    />
                  )}
                  {/* The bar */}
                  <div
                    className={`absolute top-0.5 h-5 rounded ${STATUS_COLORS[audit.status] ?? STATUS_COLORS.planned}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${name} — ${statusLabel}`}
                  />
                </div>
              </React.Fragment>
            );
          })}

          {/* Today marker label — rendered once above the grid */}
        </div>

        {/* Today label positioned above the chart */}
        {todayPct !== null && (
          <div
            className="grid"
            style={{ gridTemplateColumns: "minmax(0, 30%) minmax(0, 70%)" }}
          >
            <div />
            <div className="relative h-0">
              <div
                className="absolute flex -translate-x-1/2 flex-col items-center"
                style={{
                  left: `${todayPct}%`,
                  bottom: `${sortedAudits.length * 24 + 20}px`,
                }}
              >
                <span className="whitespace-nowrap rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-medium text-white">
                  Hôm nay
                </span>
                <svg
                  className="h-2 w-2 text-red-500"
                  viewBox="0 0 8 4"
                  fill="currentColor"
                >
                  <path d="M0 0 L4 4 L8 0 Z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-sm ${color}`}
              />
              {L.status[status] ?? status}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
