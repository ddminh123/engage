"use client";

import React, { useState, useMemo } from "react";
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
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => getRowIdFn(row),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(isTree && { expanded }),
    },
    initialState: {
      pagination: { pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    ...(isTree && {
      onExpandedChange: setExpanded,
      getSubRows,
      getExpandedRowModel: getExpandedRowModel(),
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onRowReorder) return;
    // For tree tables, only allow reorder within the same parent
    if (isTree) {
      const activeRow = rows.find((r) => r.id === active.id);
      const overRow = rows.find((r) => r.id === over.id);
      if (activeRow?.parentId !== overRow?.parentId) return;
    }
    onRowReorder(active.id as string, over.id as string);
  };

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

      {enableRowReorder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
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
                        data-state={row.getIsSelected() && "selected"}
                        className={`group/row ${onRowClick || row.getCanExpand() ? "cursor-pointer" : ""}`}
                        onClick={() => {
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
    opacity: isDragging ? 0.5 : undefined,
    position: "relative" as const,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow
          ref={setNodeRef}
          style={style}
          data-state={row.getIsSelected() && "selected"}
          className={`group/row ${onRowClick || row.getCanExpand() ? "cursor-pointer" : ""}`}
          onClick={() => {
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
