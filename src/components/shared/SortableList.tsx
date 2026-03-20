"use client";

import React, { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
} from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──

export interface SortableItem {
  id: string;
}

interface SortableListProps<T extends SortableItem> {
  items: T[];
  onReorder: (activeId: string, overId: string) => void;
  renderItem: (
    item: T,
    dragHandleProps: DragHandleRenderProps,
  ) => React.ReactNode;
  className?: string;
}

export interface DragHandleRenderProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  isDragging: boolean;
}

// ── Drag Handle (compact icon) ──

export function DragHandle({
  attributes,
  listeners,
  className,
}: {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-grab touch-none opacity-0 group-hover/row:opacity-40 hover:!opacity-100 transition-opacity",
        className,
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}

// ── Sortable Item Wrapper ──

function SortableItemWrapper<T extends SortableItem>({
  item,
  renderItem,
}: {
  item: T;
  renderItem: SortableListProps<T>["renderItem"];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem(item, { attributes, listeners, isDragging })}
    </div>
  );
}

// ── SortableList ──

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  className,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        onReorder(active.id as string, over.id as string);
      }
    },
    [onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item) => (
            <SortableItemWrapper
              key={item.id}
              item={item}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ── Helper: compute new sort orders after reorder ──

export function computeReorder<T extends { id: string }>(
  items: T[],
  activeId: string,
  overId: string,
): { id: string; sortOrder: number }[] {
  const oldIndex = items.findIndex((i) => i.id === activeId);
  const newIndex = items.findIndex((i) => i.id === overId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return [];

  const reordered = [...items];
  const [moved] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, moved);

  return reordered.map((item, idx) => ({ id: item.id, sortOrder: idx }));
}

// ── Helper: move item to top ──

export function computeMoveToTop<T extends { id: string }>(
  items: T[],
  itemId: string,
): { id: string; sortOrder: number }[] {
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx <= 0) return [];

  const reordered = [...items];
  const [moved] = reordered.splice(idx, 1);
  reordered.unshift(moved);

  return reordered.map((item, i) => ({ id: item.id, sortOrder: i }));
}
