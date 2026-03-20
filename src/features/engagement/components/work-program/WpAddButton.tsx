"use client";

import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WP_LABELS } from "../tabs/workProgramTypes";

interface WpAddButtonProps {
  /** Show "+Add objective" button (only for sections) */
  showObjective?: boolean;
  /** Show "+Add procedure" button */
  showProcedure?: boolean;
  onAddObjective?: () => void;
  onAddProcedure?: () => void;
  className?: string;
}

export function WpAddButton({
  showObjective,
  showProcedure = true,
  onAddObjective,
  onAddProcedure,
  className,
}: WpAddButtonProps) {
  return (
    <div className={className ?? "flex items-center gap-3 pl-2 py-1"}>
      {showObjective && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground hover:text-foreground"
          onClick={onAddObjective}
        >
          <Target className="mr-1 h-3 w-3 text-emerald-600" />
          {WP_LABELS.addObjective}
        </Button>
      )}
      {showProcedure && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground hover:text-foreground"
          onClick={onAddProcedure}
        >
          <Plus className="mr-1 h-3 w-3" />
          {WP_LABELS.addProcedure}
        </Button>
      )}
    </div>
  );
}
