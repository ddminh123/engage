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

const LR = ENGAGEMENT_LABELS.risk;

// ─── Props ──────────────────────────────────────────────────────────────────

interface RcmAddRiskPopoverProps {
  onSubmit: (data: { description: string; riskRating?: string; riskCategory?: string }) => void;
  onOpenLibrary: () => void;
  isSubmitting?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function RcmAddRiskPopover({
  onSubmit,
  onOpenLibrary,
  isSubmitting,
}: RcmAddRiskPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [riskRating, setRiskRating] = React.useState("");

  // Reset form when popover opens
  React.useEffect(() => {
    if (open) {
      setDescription("");
      setRiskRating("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit({
      description: description.trim(),
      riskRating: riskRating || undefined,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          />
        }
      >
        <Plus className="h-3 w-3" />
        {LR.createTitle}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="risk-desc" className="text-xs">
              {LR.field.riskDescription}
            </Label>
            <Input
              id="risk-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={LR.field.riskDescription}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="risk-rating" className="text-xs">
              {LR.field.riskRating}
            </Label>
            <Select value={riskRating} onValueChange={(v) => setRiskRating(v ?? "")}>
              <SelectTrigger id="risk-rating" className="h-8 text-xs">
                <SelectValue placeholder="Ch\u1ecdn m\u1ee9c \u0111\u00e1nh gi\u00e1" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LR.riskRating).map(([value, label]) => (
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
                {isSubmitting ? "\u0110ang th\u00eam..." : LR.createTitle}
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
