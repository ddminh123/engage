"use client";

import * as React from "react";
import { Search, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CatalogDomainTree } from "@/features/settings/components/CatalogDomainTree";
import {
  useRiskCatalogItems,
  useControlCatalogItems,
  useCopyRisksToEngagement,
  useCopyControlsToEngagement,
} from "@/features/settings/hooks/useRiskCatalog";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import type { RiskCatalogItem, ControlCatalogItem } from "@/features/settings/types/riskCatalog";

const L = ENGAGEMENT_LABELS;
const LR = L.risk;

// ─── Props ──────────────────────────────────────────────────────────────────

interface CatalogPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "risk" | "control";
  engagementId: string;
  rcmObjectiveId?: string;
  onItemsAdded?: () => void;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function CatalogPickerDialog({
  open,
  onOpenChange,
  entityType,
  engagementId,
  rcmObjectiveId,
  onItemsAdded,
}: CatalogPickerDialogProps) {
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [selectedDomainId, setSelectedDomainId] = React.useState<string | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | undefined>();

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIds(new Set());
      setSelectedDomainId(undefined);
      setSelectedCategoryId(undefined);
    }
  }, [open]);

  // Fetch catalog items
  const riskFilters = React.useMemo(
    () => ({
      search: search || undefined,
      domainId: selectedDomainId,
      categoryId: selectedCategoryId,
    }),
    [search, selectedDomainId, selectedCategoryId],
  );

  const controlFilters = React.useMemo(
    () => ({
      search: search || undefined,
    }),
    [search],
  );

  const { data: risks = [], isLoading: isLoadingRisks } = useRiskCatalogItems(
    entityType === "risk" ? riskFilters : undefined,
  );
  const { data: controls = [], isLoading: isLoadingControls } = useControlCatalogItems(
    entityType === "control" ? controlFilters : undefined,
  );

  const copyRisks = useCopyRisksToEngagement();
  const copyControls = useCopyControlsToEngagement();

  const isLoading = entityType === "risk" ? isLoadingRisks : isLoadingControls;
  const isCopying = copyRisks.isPending || copyControls.isPending;

  const items: (RiskCatalogItem | ControlCatalogItem)[] =
    entityType === "risk" ? risks : controls;

  // Toggle selection
  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  // Confirm selection
  const handleConfirm = async () => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);

    if (entityType === "risk") {
      await copyRisks.mutateAsync({
        catalogRiskIds: ids,
        engagementId,
        rcmObjectiveId,
      });
    } else {
      await copyControls.mutateAsync({
        catalogControlIds: ids,
        engagementId,
      });
    }

    onItemsAdded?.();
    onOpenChange(false);
  };

  const title =
    entityType === "risk"
      ? "Th\u00eam r\u1ee7i ro t\u1eeb th\u01b0 vi\u1ec7n"
      : "Th\u00eam ki\u1ec3m so\u00e1t t\u1eeb th\u01b0 vi\u1ec7n";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="flex max-h-[80vh] flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left sidebar — domain tree (risks only) */}
          {entityType === "risk" && (
            <div className="w-56 shrink-0 overflow-y-auto border-r pr-3">
              <CatalogDomainTree
                selectedDomainId={selectedDomainId}
                selectedCategoryId={selectedCategoryId}
                onSelectDomain={(id) => {
                  setSelectedDomainId(id);
                  setSelectedCategoryId(undefined);
                }}
                onSelectCategory={(catId, domId) => {
                  setSelectedDomainId(domId);
                  setSelectedCategoryId(catId);
                }}
                onClear={() => {
                  setSelectedDomainId(undefined);
                  setSelectedCategoryId(undefined);
                }}
              />
            </div>
          )}

          {/* Main area */}
          <div className="flex flex-1 flex-col gap-3 overflow-hidden">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={entityType === "risk" ? "T\u00ecm r\u1ee7i ro..." : "T\u00ecm ki\u1ec3m so\u00e1t..."}
                className="pl-9"
              />
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto rounded-md border">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  \u0110ang t\u1ea3i...
                </div>
              ) : items.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Kh\u00f4ng t\u00ecm th\u1ea5y m\u1ee5c n\u00e0o.
                </div>
              ) : (
                <div className="divide-y">
                  {/* Select all header */}
                  <div className="sticky top-0 z-10 flex items-center gap-3 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                    <Checkbox
                      checked={selectedIds.size === items.length && items.length > 0}
                      onCheckedChange={toggleAll}
                    />
                    <span className="flex-1">
                      {entityType === "risk" ? LR.field.riskDescription : L.control.title}
                    </span>
                    <span className="w-24 text-center">
                      {entityType === "risk" ? LR.field.riskRating : LR.field.controlType}
                    </span>
                  </div>

                  {items.map((item) => {
                    const isSelected = selectedIds.has(item.id);

                    if (entityType === "risk") {
                      const risk = item as RiskCatalogItem;
                      return (
                        <button
                          key={risk.id}
                          type="button"
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50 ${isSelected ? "bg-accent/30" : ""}`}
                          onClick={() => toggleItem(risk.id)}
                        >
                          <Checkbox checked={isSelected} tabIndex={-1} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {risk.code && (
                                <Badge variant="outline" className="shrink-0 text-[10px]">
                                  {risk.code}
                                </Badge>
                              )}
                              <span className="text-sm truncate">{risk.name}</span>
                            </div>
                            {risk.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                                {risk.description}
                              </p>
                            )}
                          </div>
                          <div className="w-24 text-center">
                            {risk.riskRating && (
                              <Badge variant="outline" className="text-[10px]">
                                {LR.riskRating[risk.riskRating] ?? risk.riskRating}
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    }

                    const control = item as ControlCatalogItem;
                    return (
                      <button
                        key={control.id}
                        type="button"
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50 ${isSelected ? "bg-accent/30" : ""}`}
                        onClick={() => toggleItem(control.id)}
                      >
                        <Checkbox checked={isSelected} tabIndex={-1} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {control.code && (
                              <Badge variant="outline" className="shrink-0 text-[10px]">
                                {control.code}
                              </Badge>
                            )}
                            <span className="text-sm truncate">{control.name}</span>
                          </div>
                          {control.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                              {control.description}
                            </p>
                          )}
                        </div>
                        <div className="w-24 text-center">
                          {control.controlType && (
                            <Badge variant="outline" className="text-[10px]">
                              {LR.controlType[control.controlType] ?? control.controlType}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            H\u1ee7y
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0 || isCopying}
          >
            {isCopying
              ? "\u0110ang th\u00eam..."
              : `Th\u00eam ${selectedIds.size} m\u1ee5c \u0111\u00e3 ch\u1ecdn`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
