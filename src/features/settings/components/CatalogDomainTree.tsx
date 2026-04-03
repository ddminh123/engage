"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRiskCatalogTree } from "../hooks/useRiskCatalog";
import { cn } from "@/lib/utils";

interface CatalogDomainTreeProps {
  selectedDomainId?: string;
  selectedCategoryId?: string;
  onSelectDomain: (id: string) => void;
  onSelectCategory: (id: string, domainId: string) => void;
  onClear: () => void;
}

export function CatalogDomainTree({
  selectedDomainId,
  selectedCategoryId,
  onSelectDomain,
  onSelectCategory,
  onClear,
}: CatalogDomainTreeProps) {
  const { data: domains = [], isLoading } = useRiskCatalogTree();
  const [expandedDomains, setExpandedDomains] = React.useState<
    Record<string, boolean>
  >({});

  // Auto-expand all domains on first load
  React.useEffect(() => {
    if (domains.length > 0 && Object.keys(expandedDomains).length === 0) {
      const initial: Record<string, boolean> = {};
      domains.forEach((d) => {
        initial[d.id] = true;
      });
      setExpandedDomains(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains]);

  const toggleExpanded = (domainId: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  const hasSelection = !!selectedDomainId || !!selectedCategoryId;

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-4">Đang tải...</div>
    );
  }

  return (
    <div className="space-y-1">
      {/* All button */}
      <Button
        variant={hasSelection ? "ghost" : "secondary"}
        size="sm"
        className="w-full justify-start gap-2"
        onClick={onClear}
      >
        <Layers className="h-4 w-4" />
        Tất cả
      </Button>

      {/* Domain tree */}
      {domains.map((domain) => {
        const isExpanded = expandedDomains[domain.id] ?? false;
        const isDomainSelected =
          selectedDomainId === domain.id && !selectedCategoryId;

        return (
          <Collapsible
            key={domain.id}
            open={isExpanded}
            onOpenChange={() => toggleExpanded(domain.id)}
          >
            <div className="flex items-center">
              <CollapsibleTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6 shrink-0"
                  />
                }
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </CollapsibleTrigger>
              <button
                type="button"
                className={cn(
                  "flex-1 text-left text-sm px-2 py-1 rounded-md truncate transition-colors",
                  isDomainSelected
                    ? "bg-accent font-medium"
                    : "hover:bg-accent/50",
                )}
                onClick={() => onSelectDomain(domain.id)}
              >
                {domain.name}
              </button>
            </div>
            <CollapsibleContent>
              <div className="ml-6 space-y-0.5">
                {domain.categories.map((category) => {
                  const isCatSelected = selectedCategoryId === category.id;
                  const riskCount = category._count?.risks ?? 0;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between text-sm px-2 py-1 rounded-md truncate transition-colors",
                        isCatSelected
                          ? "bg-accent font-medium"
                          : "hover:bg-accent/50",
                      )}
                      onClick={() =>
                        onSelectCategory(category.id, domain.id)
                      }
                    >
                      <span className="truncate">{category.name}</span>
                      {riskCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 text-[10px] shrink-0"
                        >
                          {riskCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
