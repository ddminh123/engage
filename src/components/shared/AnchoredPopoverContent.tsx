"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  computePosition,
  flip,
  shift,
  offset,
  type Placement,
} from "@floating-ui/dom";
import { cn } from "@/lib/utils";

/**
 * Create a virtual element for Floating UI positioning.
 * Accepts a DOMRect and returns it from getBoundingClientRect().
 */
export function createVirtualAnchor(rect: DOMRect) {
  return {
    getBoundingClientRect: () => rect,
  };
}

type VirtualElement = { getBoundingClientRect: () => DOMRect };

/**
 * Positioned popover content using createPortal + Floating UI computePosition.
 * Use this when you need to anchor to an arbitrary DOM rect (e.g. comment marks,
 * text selections) without requiring a Trigger element.
 *
 * Styled to match Shadcn PopoverContent.
 */
export function AnchoredPopoverContent({
  className,
  anchor,
  align = "start",
  side = "right",
  sideOffset = 8,
  children,
  onClose,
}: {
  anchor: VirtualElement;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);

  // Compute position using Floating UI
  React.useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    const placement: Placement =
      align === "center" ? side : (`${side}-${align}` as Placement);

    const update = () => {
      computePosition(anchor as unknown as Element, el, {
        placement,
        middleware: [offset(sideOffset), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        setPos({ x, y });
      });
    };

    // Initial + deferred position calculation
    update();
    const raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [anchor, side, align, sideOffset]);

  // Close on Escape
  React.useEffect(() => {
    if (!onClose) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on click outside
  React.useEffect(() => {
    if (!onClose) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const timer = setTimeout(
      () => document.addEventListener("mousedown", handleClick),
      0,
    );
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={popoverRef}
      className={cn(
        "fixed z-50 rounded-lg bg-popover text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95",
        className,
      )}
      style={pos ? { left: pos.x, top: pos.y } : { left: -9999, top: -9999 }}
    >
      {children}
    </div>,
    document.body,
  );
}
