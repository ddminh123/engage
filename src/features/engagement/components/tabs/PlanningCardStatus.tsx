"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  useAvailableTransitions,
  useExecuteTransition,
} from "../../hooks/useEngagements";
import { useStatusMap } from "@/features/settings/hooks/useApprovalStatuses";

function hexToLightBg(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.12)`;
}

function hexToBorder(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.35)`;
}

interface PlanningCardStatusProps {
  entityType: string;
  entityId: string;
  engagementId: string;
  status: string;
}

export function PlanningCardStatus({
  entityType,
  entityId,
  engagementId,
  status,
}: PlanningCardStatusProps) {
  const [open, setOpen] = useState(false);
  const { data: transitions = [], isLoading } = useAvailableTransitions(
    entityType,
    entityId,
  );
  const executeMutation = useExecuteTransition();
  const statusMap = useStatusMap();

  const info = statusMap.get(status);
  const label = info?.label ?? status;
  const color = info?.color ?? "#94a3b8";

  const hasTransitions = transitions.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: hexToLightBg(color),
              borderColor: hexToBorder(color),
              color,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        {label}
        {(hasTransitions || isLoading) && (
          <ChevronDown className="h-3 w-3 opacity-60" />
        )}
      </PopoverTrigger>
      {hasTransitions && (
        <PopoverContent
          className="w-auto min-w-[160px] p-1.5"
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-1">
            {transitions.map((t) => (
              <Button
                key={t.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start h-7 text-xs"
                disabled={executeMutation.isPending}
                onClick={() => {
                  executeMutation.mutate(
                    {
                      entityType,
                      entityId,
                      transitionId: t.id,
                      engagementId,
                    },
                    { onSuccess: () => setOpen(false) },
                  );
                }}
              >
                {executeMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : null}
                {t.actionLabel}
              </Button>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
