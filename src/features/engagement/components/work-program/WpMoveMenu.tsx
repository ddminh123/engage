"use client";

import { Layers, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { EngagementSection, EngagementObjective } from "../../types";

// ── Move objective menu ──

interface MoveObjectiveMenuProps {
  objectiveId: string;
  currentSectionId: string | null;
  sections: EngagementSection[];
  onMove: (objectiveId: string, targetSectionId: string | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoveObjectiveMenu({
  objectiveId,
  currentSectionId,
  sections,
  onMove,
  open,
  onOpenChange,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chuyển mục tiêu đến</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Tìm kiếm..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả</CommandEmpty>
            <CommandGroup>
              {destinations.map((d) => (
                <CommandItem
                  key={d.id ?? "__standalone__"}
                  disabled={d.isCurrent}
                  onSelect={() => {
                    if (!d.isCurrent) {
                      onMove(objectiveId, d.id);
                      onOpenChange(false);
                    }
                  }}
                >
                  {d.id === null ? (
                    <Target className="mr-2 h-4 w-4 text-emerald-600" />
                  ) : (
                    <Layers className="mr-2 h-4 w-4 text-blue-600" />
                  )}
                  <span className="flex-1">{d.label}</span>
                  {d.isCurrent && (
                    <span className="text-xs text-muted-foreground">
                      (hiện tại)
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoveProcedureMenu({
  procedureId,
  currentObjectiveId,
  currentSectionId,
  sections,
  standaloneObjectives,
  onMove,
  open,
  onOpenChange,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chuyển thủ tục đến</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Tìm kiếm..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả</CommandEmpty>
            <CommandGroup>
              {destinations.map((d) => (
                <CommandItem
                  key={d.id}
                  disabled={d.isCurrent}
                  className={d.icon === "objective" ? "pl-8" : ""}
                  onSelect={() => {
                    if (!d.isCurrent) {
                      onMove(procedureId, {
                        sectionId: d.sectionId,
                        objectiveId: d.objectiveId,
                      });
                      onOpenChange(false);
                    }
                  }}
                >
                  {d.icon === "section" ? (
                    <Layers className="mr-2 h-4 w-4 shrink-0 text-blue-600" />
                  ) : (
                    <Target className="mr-2 h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  <span className="flex-1">{d.label}</span>
                  {d.isCurrent && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      (hiện tại)
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
