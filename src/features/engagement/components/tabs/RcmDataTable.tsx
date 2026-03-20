"use client";

import { useCallback, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  ArrowUpToLine,
  Copy,
} from "lucide-react";
import { useBatchAction } from "../../hooks/useEngagements";
import type { BatchEntityType } from "../../api";
import { Button } from "@/components/ui/button";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { RcmObjective } from "../../types";
import { type RcmRow, LR } from "./rcmTypes";
import { useRcmEditor } from "./useRcmEditor";
import { useRcmColumns } from "./rcmColumns";

// ── Main Component ──

interface RcmDataTableProps {
  engagementId: string;
  rcmObjectives: RcmObjective[];
}

export function RcmDataTable({
  engagementId,
  rcmObjectives,
}: RcmDataTableProps) {
  const editor = useRcmEditor(engagementId, rcmObjectives);
  const {
    state,
    dispatch,
    treeData,
    riskMap,
    controlMap,
    syncObj,
    handleConfirmDelete,
    deleteTitle,
    deleteDesc,
    isDeleting,
    handleReorderRows,
    handleMoveToTop,
  } = editor;

  const columns = useRcmColumns(editor);
  const batchAction = useBatchAction();

  // Map row type → batch entity type
  const rcmEntityTypeMap: Record<string, BatchEntityType> = {
    objective: "rcm_objective",
    risk: "risk",
    control: "control",
  };

  // Build flat ID→type lookup from tree
  const rowTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (rows: RcmRow[]) => {
      for (const r of rows) {
        map.set(r.id, r.type);
        if (r.children.length) walk(r.children);
      }
    };
    walk(treeData);
    return map;
  }, [treeData]);

  const canSelectRcmRow = useCallback(
    (row: RcmRow) =>
      row.type === "objective" || row.type === "risk" || row.type === "control",
    [],
  );

  const handleBatch = useCallback(
    (
      action: "delete" | "duplicate",
      selectedIds: string[],
      clear: () => void,
    ) => {
      // Group by entity type
      const groups = new Map<BatchEntityType, string[]>();
      for (const id of selectedIds) {
        const rowType = rowTypeMap.get(id);
        if (!rowType) continue;
        const entityType = rcmEntityTypeMap[rowType];
        if (!entityType) continue;
        const arr = groups.get(entityType) ?? [];
        arr.push(id);
        groups.set(entityType, arr);
      }
      // Fire one mutation per entity type
      for (const [entityType, ids] of groups) {
        batchAction.mutate({ engagementId, action, entityType, ids });
      }
      clear();
    },
    [engagementId, batchAction, rowTypeMap, rcmEntityTypeMap],
  );

  const renderBatchBar = useCallback(
    (selectedIds: string[], clear: () => void) => (
      <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm">
        <span className="font-medium">{selectedIds.length} đã chọn</span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleBatch("duplicate", selectedIds, clear)}
            disabled={batchAction.isPending}
          >
            <Copy className="mr-1 h-3 w-3" />
            Nhân bản
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => handleBatch("delete", selectedIds, clear)}
            disabled={batchAction.isPending}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Xóa
          </Button>
        </div>
      </div>
    ),
    [handleBatch, batchAction.isPending],
  );

  // ── Context menu ──

  const renderContextMenu = useCallback(
    (row: RcmRow) => {
      if (
        row.type === "add_risk" ||
        row.type === "add_control" ||
        row.type === "add_objective" ||
        row.type === "btn_add_risk" ||
        row.type === "btn_add_control"
      )
        return null;

      if (row.type === "objective") {
        return (
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => handleMoveToTop(row.id, "objective")}
            >
              <ArrowUpToLine className="mr-2 h-4 w-4" />
              Đưa lên đầu
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() =>
                dispatch({
                  type: "START_EDIT_OBJECTIVE",
                  id: row.id,
                  title: row.description,
                })
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa mục tiêu
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() =>
                dispatch({ type: "START_ADD_RISK", objectiveId: row.id })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm rủi ro
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                dispatch({
                  type: "SET_DELETE",
                  target: {
                    type: "objective",
                    id: row.id,
                    title: row.description.slice(0, 40),
                  },
                })
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa mục tiêu
            </ContextMenuItem>
          </ContextMenuContent>
        );
      }

      if (row.type === "risk") {
        const risk = riskMap.get(row.id);
        return (
          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleMoveToTop(row.id, "risk")}>
              <ArrowUpToLine className="mr-2 h-4 w-4" />
              Đưa lên đầu
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() =>
                dispatch({ type: "START_ADD_CONTROL", riskId: row.id })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm kiểm soát
            </ContextMenuItem>
            <ContextMenuSeparator />
            {risk && (
              <ContextMenuItem
                onClick={() => dispatch({ type: "START_EDIT_RISK", risk })}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </ContextMenuItem>
            )}
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                dispatch({
                  type: "SET_DELETE",
                  target: {
                    type: "risk",
                    id: row.id,
                    title: row.description.slice(0, 40),
                  },
                })
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa rủi ro
            </ContextMenuItem>
          </ContextMenuContent>
        );
      }

      if (row.type === "control") {
        const lookup = controlMap.get(row.id);
        return (
          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleMoveToTop(row.id, "control")}>
              <ArrowUpToLine className="mr-2 h-4 w-4" />
              Đưa lên đầu
            </ContextMenuItem>
            <ContextMenuSeparator />
            {lookup && (
              <ContextMenuItem
                onClick={() =>
                  dispatch({
                    type: "START_EDIT_CONTROL",
                    control: lookup.control,
                    riskId: lookup.riskId,
                  })
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </ContextMenuItem>
            )}
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                dispatch({
                  type: "SET_DELETE",
                  target: {
                    type: "control",
                    id: row.id,
                    riskId: lookup?.riskId,
                    title: row.description.slice(0, 40),
                  },
                })
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa kiểm soát
            </ContextMenuItem>
          </ContextMenuContent>
        );
      }

      return null;
    },
    [dispatch, riskMap, controlMap, handleMoveToTop],
  );

  return (
    <>
      <div className="mb-2 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => syncObj.mutate({ engagementId })}
          disabled={syncObj.isPending}
        >
          <Download className="mr-1 h-3 w-3" />
          {syncObj.isPending ? "Đang đồng bộ..." : "Lấy mục tiêu kiểm toán"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => dispatch({ type: "START_ADD_OBJECTIVE" })}
        >
          <Plus className="mr-1 h-3 w-3" />
          Thêm mục tiêu
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={treeData}
        getSubRows={(row) =>
          row.children.length > 0 ? row.children : undefined
        }
        renderContextMenu={renderContextMenu}
        emptyMessage={LR.noData}
        pageSize={100}
        hideToolbar
        enableRowReorder
        onRowReorder={handleReorderRows}
        enableRowSelection
        canSelectRow={canSelectRcmRow}
        renderBatchBar={renderBatchBar}
      />

      <ConfirmDialog
        open={!!state.deleteTarget}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLEAR_DELETE" });
        }}
        title={deleteTitle}
        description={deleteDesc}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
