"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { usePlanningSteps } from "@/features/settings/hooks/usePlanningSteps";

const L = ENGAGEMENT_LABELS.engagement;

interface NavItem {
  key: string;
  label: string;
  href: string;
  children?: NavItem[];
}

interface EngagementSidebarProps {
  engagementId: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function EngagementSidebar({
  engagementId,
  collapsed = false,
  onCollapsedChange,
}: EngagementSidebarProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const currentSection = searchParams.get("section");

  // Fetch planning steps for dynamic sub-navigation
  const { data: stepConfigs } = usePlanningSteps();
  const activeSteps = React.useMemo(
    () =>
      (stepConfigs ?? [])
        .filter((s) => s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [stepConfigs],
  );

  // Track which nav items are expanded
  const [expanded, setExpanded] = React.useState<Set<string>>(
    new Set(["planning"]),
  );

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Build planning sub-items from step configs
  const planningChildren: NavItem[] = activeSteps.map((step) => ({
    key: step.key,
    label: step.title,
    href: `/engagement/${engagementId}?tab=planning&section=${step.key}`,
  }));

  const navItems: NavItem[] = [
    {
      key: "overview",
      label: "Tổng quan",
      href: `/engagement/${engagementId}`,
    },
    {
      key: "planning",
      label: L.tab.planning,
      href: `/engagement/${engagementId}?tab=planning`,
      children: planningChildren,
    },
    {
      key: "execution",
      label: L.tab.execution,
      href: `/engagement/${engagementId}?tab=execution`,
    },
    {
      key: "findings",
      label: L.tab.findings,
      href: `/engagement/${engagementId}?tab=findings`,
    },
    {
      key: "reporting",
      label: L.tab.reporting,
      href: `/engagement/${engagementId}?tab=reporting`,
    },
  ];

  const renderNavItem = (item: NavItem) => {
    // Overview is active when no tab param, others match by key
    const isActive =
      item.key === "overview"
        ? !currentTab
        : currentTab === item.key && (!item.children || !currentSection);
    const isExpanded = expanded.has(item.key);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.key}>
        <div className="flex items-center">
          {/* Expand/collapse button for items with children */}
          {hasChildren && !collapsed && (
            <button
              onClick={() => toggleExpand(item.key)}
              className="p-1 hover:bg-accent/50 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          <Link
            href={item.href}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center px-2",
              !hasChildren && !collapsed && "ml-5",
            )}
            title={collapsed ? item.label : undefined}
          >
            {!collapsed && <span>{item.label}</span>}
          </Link>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-6 mt-1 space-y-0.5 border-l pl-3">
            {item.children!.map((child) => {
              const isChildActive =
                currentTab === "planning" && currentSection === child.key;

              return (
                <Link
                  key={child.key}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isChildActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col border-r bg-muted/30">
      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full",
            collapsed ? "justify-center" : "justify-start",
          )}
          onClick={() => onCollapsedChange?.(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>Thu gọn</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
