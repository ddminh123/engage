"use client";

import * as React from "react";
import { Building2, User, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COMMON_LABELS } from "@/constants/labels";
import { useOrgUnit } from "../hooks/useOrgUnits";
import { OrgUnitDetail } from "./OrgUnitDetail";

const C = COMMON_LABELS;

// =============================================================================
// Card content — fetches full org unit data on mount
// =============================================================================

interface OrgUnitCardContentProps {
  id: string;
  onTitleClick?: () => void;
}

function OrgUnitCardContent({ id, onTitleClick }: OrgUnitCardContentProps) {
  const { data: unit, isLoading } = useOrgUnit(id);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
    );
  }

  if (!unit) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <button
          type="button"
          className="font-semibold text-sm text-left hover:underline focus:outline-none"
          onClick={onTitleClick}
        >
          {unit.name}
        </button>
        {unit.code && (
          <div className="text-xs text-muted-foreground font-mono">
            {unit.code}
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-1.5 text-xs">
        {unit.parentName && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <GitBranch className="h-3.5 w-3.5 shrink-0" />
            <span>{unit.parentName}</span>
          </div>
        )}
        {unit.leader && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>
              {unit.leader.name}
              {unit.leader.position && ` · ${unit.leader.position}`}
            </span>
          </div>
        )}
        {unit.description && (
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{unit.description}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <Badge
        variant={unit.status === "active" ? "default" : "secondary"}
        className="text-xs"
      >
        {unit.status === "active" ? C.status.active : C.status.inactive}
      </Badge>
    </div>
  );
}

// =============================================================================
// Popover wrapper — trigger is the children node, fetches on open
// =============================================================================

interface OrgUnitCardPopoverProps {
  id: string;
  children: React.ReactNode;
}

export function OrgUnitCardPopover({ id, children }: OrgUnitCardPopoverProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const { data: unit } = useOrgUnit(detailOpen ? id : null);

  const handleTitleClick = () => {
    setPopoverOpen(false);
    setDetailOpen(true);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="cursor-pointer hover:underline focus:outline-none focus-visible:underline"
              onClick={(e) => e.stopPropagation()}
            />
          }
        >
          {children}
        </PopoverTrigger>
        <PopoverContent side="top" className="w-64 p-3">
          {popoverOpen && (
            <OrgUnitCardContent id={id} onTitleClick={handleTitleClick} />
          )}
        </PopoverContent>
      </Popover>

      <OrgUnitDetail
        unit={unit ?? null}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
