"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SETTINGS_NAV_ITEMS } from "@/constants";

const MIN_WIDTH = 48;
const MAX_WIDTH = 280;
const DEFAULT_WIDTH = 224;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
        setSidebarWidth(newWidth < 72 ? MIN_WIDTH : newWidth);
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

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Left Sidebar */}
      <div className="relative flex-shrink-0" style={{ width: sidebarWidth }}>
        <aside className="flex h-full w-full flex-col border-r bg-muted/30">
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto p-2">
            {SETTINGS_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/settings"
                  ? pathname === "/settings"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground truncate",
                    isActive && "bg-accent text-accent-foreground",
                    isCollapsed && "px-2 text-center",
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {isCollapsed ? item.label.charAt(0) : item.label}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full",
                isCollapsed ? "justify-center" : "justify-start",
              )}
              onClick={() =>
                setSidebarWidth(isCollapsed ? DEFAULT_WIDTH : MIN_WIDTH)
              }
            >
              {isCollapsed ? (
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

        {/* Drag handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors z-10"
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
