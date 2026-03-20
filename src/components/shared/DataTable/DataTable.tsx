"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  pageSize?: number;
  /** For tree/hierarchical data — return sub-rows for a given row */
  getSubRows?: (row: TData) => TData[] | undefined;
  /** When provided, renders a right-click context menu for each row */
  renderContextMenu?: (row: TData) => React.ReactNode;
  /** Server-side search callback. When provided, search bypasses client-side column filters. */
  onSearch?: (query: string) => void;
  /** Initial column visibility — keys are column IDs, false = hidden by default */
  defaultColumnVisibility?: VisibilityState;
  /** Hide the toolbar (search, column toggle) and table header row */
  hideToolbar?: boolean;
  /** Enable drag-and-drop row reordering (requires getRowId) */
  enableRowReorder?: boolean;
  /** Called when a row is dragged to a new position. Only fires for rows with the same parent. */
  onRowReorder?: (activeId: string, overId: string) => void;
  /** Get the unique ID for a row (required for DnD). Defaults to (row as any).id */
  getRowId?: (row: TData) => string;
  /** Whether tree rows start expanded. Defaults to true (all expanded). Set false to start collapsed. */
  defaultExpanded?: boolean;
  /** Enable checkbox row selection */
  enableRowSelection?: boolean;
  /** Filter which rows can be selected (return true = selectable). Only used when enableRowSelection is true. */
  canSelectRow?: (row: TData) => boolean;
  /** Render a batch action bar when rows are selected. Receives selected row IDs and a clear callback. */
  renderBatchBar?: (
    selectedIds: string[],
    clearSelection: () => void,
  ) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  isLoading = false,
  emptyMessage = "Không có dữ liệu.",
  actions,
  onRowClick,
  pageSize = 20,
  getSubRows,
  renderContextMenu,
  onSearch,
  defaultColumnVisibility = {},
  hideToolbar = false,
  enableRowReorder = false,
  onRowReorder,
  getRowId: getRowIdProp,
  defaultExpanded = true,
  enableRowSelection = false,
  canSelectRow,
  renderBatchBar,
}: DataTableProps<TData, TValue>) {
  const isTree = !!getSubRows;
  const defaultGetRowId = (row: TData) =>
    (row as Record<string, unknown>).id as string;
  const getRowIdFn = getRowIdProp ?? defaultGetRowId;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultColumnVisibility,
  );
  // Expanded state as an explicit Record — never use boolean `true`.
  // This avoids TanStack's lossy boolean→object conversion that drops other rows.
  const [expanded, setExpanded] = useState<ExpandedState>(() => {
    if (!getSubRows || !defaultExpanded) return {};
    const result: Record<string, boolean> = {};
    const walk = (items: TData[]) => {
      for (const item of items) {
        result[getRowIdFn(item)] = true;
        const subs = getSubRows(item);
        if (subs) walk(subs);
      }
    };
    walk(data);
    return result;
  });

  // When data changes (new rows added), mark them as expanded too — only if defaultExpanded
  useEffect(() => {
    if (!isTree || !defaultExpanded) return;
    setExpanded((old) => {
      if (typeof old !== "object") return old;
      let changed = false;
      const record = { ...old };
      const walk = (items: TData[]) => {
        for (const item of items) {
          const id = getRowIdFn(item);
          if (!(id in record)) {
            record[id] = true;
            changed = true;
          }
          const subs = getSubRows?.(item);
          if (subs) walk(subs);
        }
      };
      walk(data);
      return changed ? record : old;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ── Row selection (manual state, no TanStack integration) ──
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Reset selection when data changes
  useEffect(() => {
    setRowSelection({});
  }, [data]);

  // Selection is currently disabled (checkbox column removed).
  // State + batch bar kept so renderBatchBar still works if provided externally.
  const finalColumns = columns;

  const table = useReactTable({
    data,
    columns: finalColumns,
    getRowId: (row) => getRowIdFn(row),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      ...(isTree && { expanded }),
    },
    initialState: {
      pagination: { pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    ...(isTree && {
      onExpandedChange: setExpanded,
      getSubRows,
      getExpandedRowModel: getExpandedRowModel(),
      autoResetExpanded: false,
    }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(!isTree && { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
  });

  // DnD sensors & row ID list
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const rows = table.getRowModel().rows;
  const rowIds = useMemo(() => rows.map((r) => r.id), [rows]);

  // ── Tree-aware DnD: collapse children while dragging ──
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const expandedBeforeDrag = useRef<ExpandedState | null>(null);
  const dragDescendantCount = useRef(0);
  // Snapshot the row's cell data before collapse so overlay can render it
  const dragCellSnapshot = useRef<
    { id: string; rendered: React.ReactNode }[] | null
  >(null);

  // Count all nested descendants for the drag overlay badge
  const countDescendants = useCallback((row: Row<TData>): number => {
    const subs = row.subRows ?? [];
    return subs.reduce((sum, r) => sum + 1 + countDescendants(r), 0);
  }, []);

  // Keep a ref to the latest expanded state so handleDragStart doesn't go stale
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as string;

      // Capture descendant count BEFORE collapsing
      const draggedRow = rows.find((r) => r.id === id);
      dragDescendantCount.current = draggedRow
        ? countDescendants(draggedRow)
        : 0;
      // Snapshot rendered cells for the overlay
      dragCellSnapshot.current = draggedRow
        ? draggedRow.getVisibleCells().map((cell) => ({
            id: cell.id,
            rendered: flexRender(cell.column.columnDef.cell, cell.getContext()),
          }))
        : null;

      setActiveRowId(id);

      if (!isTree) return;

      const currentExpanded = expandedRef.current;
      // Snapshot current expansion state
      expandedBeforeDrag.current = currentExpanded;

      // Collapse the dragged row so children visually move with it
      if (draggedRow?.getCanExpand() && draggedRow.getIsExpanded()) {
        if (typeof currentExpanded === "object") {
          const next = { ...currentExpanded };
          delete next[id];
          setExpanded(next);
        }
      }
    },
    [isTree, rows, countDescendants],
  );

  const restoreExpansion = useCallback(() => {
    setActiveRowId(null);
    if (expandedBeforeDrag.current !== null) {
      setExpanded(expandedBeforeDrag.current);
      expandedBeforeDrag.current = null;
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      restoreExpansion();
      if (!over || active.id === over.id || !onRowReorder) return;
      // For tree tables, only allow reorder within the same parent
      if (isTree) {
        const aRow = rows.find((r) => r.id === active.id);
        const oRow = rows.find((r) => r.id === over.id);
        if (aRow?.parentId !== oRow?.parentId) return;
      }
      onRowReorder(active.id as string, over.id as string);
    },
    [isTree, rows, onRowReorder, restoreExpansion],
  );

  const handleDragCancel = useCallback(() => {
    restoreExpansion();
  }, [restoreExpansion]);

  return (
    <div className="space-y-4">
      {!hideToolbar && (
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          actions={actions}
          onSearch={onSearch}
        />
      )}

      {/* Batch action bar when rows are selected */}
      {enableRowSelection &&
        renderBatchBar &&
        (() => {
          const selectedIds = Object.keys(rowSelection).filter(
            (id) => rowSelection[id],
          );
          if (selectedIds.length === 0) return null;
          return renderBatchBar(selectedIds, () => setRowSelection({}));
        })()}

      {enableRowReorder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="rounded-md border">
            <Table>
              {!hideToolbar && (
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {enableRowReorder && <TableHead className="w-6" />}
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
              )}
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {columns.map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : rows.length ? (
                  <SortableContext
                    items={rowIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {rows.map((row) => (
                      <SortableRow
                        key={row.id}
                        row={row}
                        onRowClick={onRowClick}
                        renderContextMenu={renderContextMenu}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* DragOverlay — renders a floating preview of the dragged row */}
          <DragOverlay>
            {activeRowId && dragCellSnapshot.current ? (
              <DragOverlayContent
                cells={dragCellSnapshot.current}
                descendantCount={dragDescendantCount.current}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="rounded-md border">
          <Table>
            {!hideToolbar && (
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            )}
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length ? (
                rows.map((row) => (
                  <ContextMenu key={row.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        data-row-id={row.id}
                        className={`group/row ${onRowClick || row.getCanExpand() ? "cursor-pointer" : ""}`}
                        onClick={(e) => {
                          if (
                            (e.target as HTMLElement).closest(
                              'button, input, textarea, [role="button"], a',
                            )
                          )
                            return;
                          if (onRowClick) onRowClick(row.original);
                          else if (row.getCanExpand()) row.toggleExpanded();
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </ContextMenuTrigger>
                    {renderContextMenu?.(row.original)}
                  </ContextMenu>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!isTree && <DataTablePagination table={table} />}
    </div>
  );
}

// ── Sortable Row (used when enableRowReorder is true) ──

function SortableRow<TData>({
  row,
  onRowClick,
  renderContextMenu,
}: {
  row: Row<TData>;
  onRowClick?: (row: TData) => void;
  renderContextMenu?: (row: TData) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Dim original row while DragOverlay shows the floating preview
    opacity: isDragging ? 0.3 : undefined,
    position: "relative" as const,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow
          ref={setNodeRef}
          data-row-id={row.id}
          style={style}
          className={`group/row ${onRowClick || row.getCanExpand() ? "cursor-pointer" : ""}`}
          onClick={(e) => {
            if (
              (e.target as HTMLElement).closest(
                'button, input, textarea, [role="button"], a',
              )
            )
              return;
            if (onRowClick) onRowClick(row.original);
            else if (row.getCanExpand()) row.toggleExpanded();
          }}
        >
          {/* Drag handle cell */}
          <TableCell className="w-6 px-1">
            <button
              type="button"
              className="cursor-grab touch-none opacity-0 group-hover/row:opacity-40 hover:!opacity-100 transition-opacity"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </TableCell>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      </ContextMenuTrigger>
      {renderContextMenu?.(row.original)}
    </ContextMenu>
  );
}

// ── Drag Overlay Content (floating preview while dragging) ──
// Uses snapshotted cell renders captured before the row was collapsed

function DragOverlayContent({
  cells,
  descendantCount,
}: {
  cells: { id: string; rendered: React.ReactNode }[];
  descendantCount: number;
}) {
  return (
    <div className="rounded-md border bg-background shadow-lg overflow-hidden">
      <table className="w-full">
        <tbody>
          <tr>
            <td className="w-6 px-1">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </td>
            {cells.map((cell) => (
              <td key={cell.id} className="p-2 text-sm">
                {cell.rendered}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {descendantCount > 0 && (
        <div className="border-t px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 flex items-center gap-1">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-medium">
            {descendantCount}
          </span>
          mục con
        </div>
      )}
    </div>
  );
}
