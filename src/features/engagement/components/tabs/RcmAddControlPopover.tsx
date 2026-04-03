"use client";

import * as React from "react";
import { Plus, BookOpen } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENGAGEMENT_LABELS } from "@/constants/labels";

const L = ENGAGEMENT_LABELS;
const LR = L.risk;

// ─── Props ──────────────────────────────────────────────────────────────────

interface RcmAddControlPopoverProps {
  onSubmit: (data: { description: string; controlType?: string }) => void;
  onOpenLibrary: () => void;
  isSubmitting?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function RcmAddControlPopover({
  onSubmit,
  onOpenLibrary,
  isSubmitting,
}: RcmAddControlPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [controlType, setControlType] = React.useState("");

  // Reset form when popover opens
  React.useEffect(() => {
    if (open) {
      setDescription("");
      setControlType("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit({
      description: description.trim(),
      controlType: controlType || undefined,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-6 items-center gap-0.5 rounded-md px-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          />
        }
      >
        <Plus className="h-3 w-3" />
        {L.control.addNew}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="control-desc" className="text-xs">
              {LR.field.controlDescription}
            </Label>
            <Input
              id="control-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={LR.field.controlDescription}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="control-type" className="text-xs">
              {LR.field.controlType}
            </Label>
            <Select value={controlType} onValueChange={(v) => setControlType(v ?? "")}>
              <SelectTrigger id="control-type" className="h-8 text-xs">
                <SelectValue placeholder="Ch\u1ecdn lo\u1ea1i ki\u1ec3m so\u00e1t" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LR.controlType).map(([value, label]) => (
                  <SelectItem key={value} value={value} label={label as string}>
                    {label as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setOpen(false);
                onOpenLibrary();
              }}
            >
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              T\u00ecm t\u1eeb th\u01b0 vi\u1ec7n
            </Button>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setOpen(false)}
              >
                H\u1ee7y
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs"
                disabled={!description.trim() || isSubmitting}
              >
                {isSubmitting ? "\u0110ang th\u00eam..." : L.control.createTitle}
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
