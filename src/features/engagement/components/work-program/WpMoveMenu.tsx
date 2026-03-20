"use client";

import { ArrowRightLeft, Layers, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EngagementSection, EngagementObjective } from "../../types";

// ── Move objective menu ──

interface MoveObjectiveMenuProps {
  objectiveId: string;
  currentSectionId: string | null;
  sections: EngagementSection[];
  onMove: (objectiveId: string, targetSectionId: string | null) => void;
  disabled?: boolean;
}

export function MoveObjectiveMenu({
  objectiveId,
  currentSectionId,
  sections,
  onMove,
  disabled,
}: MoveObjectiveMenuProps) {
  const destinations = [
    {
      id: null as string | null,
      label: "Mục tiêu độc lập",
      isCurrent: currentSectionId === null,
    },
    ...sections.map((s) => ({
      id: s.id as string | null,
      label: s.title,
      isCurrent: s.id === currentSectionId,
    })),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title="Chuyển đến..."
            disabled={disabled}
          />
        }
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Chuyển mục tiêu đến</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {destinations.map((d) => (
            <DropdownMenuItem
              key={d.id ?? "__standalone__"}
              disabled={d.isCurrent}
              onClick={() => {
                if (!d.isCurrent) onMove(objectiveId, d.id);
              }}
            >
              {d.id === null ? (
                <Target className="mr-2 h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Layers className="mr-2 h-3.5 w-3.5 text-blue-600" />
              )}
              <span className="truncate">{d.label}</span>
              {d.isCurrent && (
                <span className="ml-auto text-xs text-muted-foreground">
                  (hiện tại)
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Move procedure menu ──

interface MoveProcedureMenuProps {
  procedureId: string;
  currentObjectiveId: string | null;
  currentSectionId: string | null;
  sections: EngagementSection[];
  standaloneObjectives: EngagementObjective[];
  onMove: (
    procedureId: string,
    target: { sectionId: string | null; objectiveId: string | null },
  ) => void;
  disabled?: boolean;
}

export function MoveProcedureMenu({
  procedureId,
  currentObjectiveId,
  currentSectionId,
  sections,
  standaloneObjectives,
  onMove,
  disabled,
}: MoveProcedureMenuProps) {
  // Build destination list: sections (direct) + all objectives (in sections + standalone)
  type Dest = {
    id: string;
    label: string;
    sectionId: string | null;
    objectiveId: string | null;
    isCurrent: boolean;
    icon: "section" | "objective";
  };

  const destinations: Dest[] = [];

  // Sections as direct targets
  for (const s of sections) {
    destinations.push({
      id: `sec:${s.id}`,
      label: s.title,
      sectionId: s.id,
      objectiveId: null,
      isCurrent: currentSectionId === s.id && currentObjectiveId === null,
      icon: "section",
    });
    // Objectives within section
    for (const o of s.objectives) {
      destinations.push({
        id: `obj:${o.id}`,
        label: o.title,
        sectionId: null,
        objectiveId: o.id,
        isCurrent: currentObjectiveId === o.id,
        icon: "objective",
      });
    }
  }

  // Standalone objectives
  for (const o of standaloneObjectives) {
    destinations.push({
      id: `obj:${o.id}`,
      label: o.title,
      sectionId: null,
      objectiveId: o.id,
      isCurrent: currentObjectiveId === o.id,
      icon: "objective",
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title="Chuyển đến..."
            disabled={disabled}
          />
        }
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 max-h-64 overflow-y-auto"
      >
        <DropdownMenuLabel>Chuyển thủ tục đến</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {destinations.map((d) => (
            <DropdownMenuItem
              key={d.id}
              disabled={d.isCurrent}
              className={d.icon === "objective" ? "pl-6" : ""}
              onClick={() => {
                if (!d.isCurrent)
                  onMove(procedureId, {
                    sectionId: d.sectionId,
                    objectiveId: d.objectiveId,
                  });
              }}
            >
              {d.icon === "section" ? (
                <Layers className="mr-2 h-3.5 w-3.5 shrink-0 text-blue-600" />
              ) : (
                <Target className="mr-2 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              )}
              <span className="truncate">{d.label}</span>
              {d.isCurrent && (
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  (hiện tại)
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
