"use client";

import * as React from "react";
import { EngagementHeader } from "./EngagementHeader";
import { EngagementSidebar } from "./EngagementSidebar";
import { EngagementTabRouter } from "./EngagementTabRouter";
import type { EngagementDetail } from "../../types";

interface EngagementDetailLayoutProps {
  engagement: EngagementDetail;
  onOpenWorkpaper?: (procedureId: string) => void;
}

const MIN_WIDTH = 56;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 224;

export function EngagementDetailLayout({
  engagement,
  onOpenWorkpaper,
}: EngagementDetailLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = React.useState(DEFAULT_WIDTH);
  const isCollapsed = sidebarWidth <= MIN_WIDTH;
  const isDragging = React.useRef(false);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const startX = e.clientX;
      const startWidth = sidebarWidth;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = ev.clientX - startX;
        const newWidth = Math.max(
          MIN_WIDTH,
          Math.min(MAX_WIDTH, startWidth + delta),
        );
        // Snap to collapsed if dragged small enough
        setSidebarWidth(newWidth < 80 ? MIN_WIDTH : newWidth);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [sidebarWidth],
  );

  const handleCollapsedChange = React.useCallback((collapsed: boolean) => {
    setSidebarWidth(collapsed ? MIN_WIDTH : DEFAULT_WIDTH);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header: Breadcrumb + Team + Status + Actions */}
      <EngagementHeader engagement={engagement} />

      {/* Main content area: Sidebar + Tab content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Navigation only */}
        <div className="relative flex-shrink-0" style={{ width: sidebarWidth }}>
          <EngagementSidebar
            engagementId={engagement.id}
            collapsed={isCollapsed}
            onCollapsedChange={handleCollapsedChange}
          />
          {/* Drag handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors z-10"
            onMouseDown={handleMouseDown}
          />
        </div>

        {/* Tab Content */}
        <main className="flex-1 overflow-auto p-6">
          <EngagementTabRouter
            engagement={engagement}
            onOpenWorkpaper={onOpenWorkpaper}
          />
        </main>
      </div>
    </div>
  );
}
