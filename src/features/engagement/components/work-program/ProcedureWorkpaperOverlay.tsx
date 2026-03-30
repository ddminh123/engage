"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProcedureWorkpaper } from "./ProcedureWorkpaper";
import type {
  EngagementProcedure,
  EngagementMember,
  WpAssignment,
  WpSignoff,
} from "../../types";
import type { MultiSelectOption } from "@/components/shared/MultiSelectCommand";

interface ProcedureWorkpaperOverlayProps {
  procedure: EngagementProcedure;
  engagementId: string;
  onClose: () => void;
  controlOptions?: MultiSelectOption[];
  members?: EngagementMember[];
  wpAssignments?: WpAssignment[];
  wpSignoffs?: WpSignoff[];
  onAssign?: (entityType: string, entityId: string, userId: string) => void;
  onUnassign?: (entityType: string, entityId: string, userId: string) => void;
}

export function ProcedureWorkpaperOverlay({
  procedure,
  engagementId,
  onClose,
  controlOptions,
  members,
  wpAssignments,
  wpSignoffs,
  onAssign,
  onUnassign,
}: ProcedureWorkpaperOverlayProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when overlay is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header with close button */}
      <div className="flex h-12 items-center justify-between border-b px-4">
        <h2 className="text-sm font-medium truncate max-w-[50%]">
          {procedure.title}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Đóng</span>
        </Button>
      </div>

      {/* Workpaper content */}
      <div className="flex-1 overflow-auto">
        <ProcedureWorkpaper
          procedure={procedure}
          engagementId={engagementId}
          onBack={onClose}
          controlOptions={controlOptions}
          members={members}
          wpAssignments={wpAssignments}
          wpSignoffs={wpSignoffs}
          onAssign={onAssign}
          onUnassign={onUnassign}
        />
      </div>
    </div>
  );
}
