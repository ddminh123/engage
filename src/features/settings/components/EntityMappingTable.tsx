"use client";

import * as React from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useApprovalWorkflows,
  useUpsertEntityBinding,
  useDeleteEntityBinding,
} from "../hooks/useApprovalWorkflows";
import {
  useEntityTypeOptions,
  encodeEntityOption,
  decodeEntityOption,
} from "../hooks/useEntityTypeOptions";

// ── Row type ──

interface BindingRow {
  id: string;
  entityType: string;
  subType: string;
  encodedKey: string;
  workflowId: string;
  workflowName: string;
  isDefault: boolean;
}

// ── Main Component ──

export function EntityMappingTable() {
  const { data: workflows = [], isLoading } = useApprovalWorkflows();
  const upsertBinding = useUpsertEntityBinding();
  const deleteBinding = useDeleteEntityBinding();
  const { options: entityTypeOptions, optionLabel } = useEntityTypeOptions();

  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [newEncodedType, setNewEncodedType] = React.useState("");
  const [newWorkflowId, setNewWorkflowId] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<{
    entityType: string;
    subType: string;
  } | null>(null);

  // Collect all bindings from all workflows
  const allBindings: BindingRow[] = React.useMemo(() => {
    const bindings: BindingRow[] = [];
    for (const wf of workflows) {
      for (const b of wf.entityBindings) {
        bindings.push({
          id: b.id,
          entityType: b.entityType,
          subType: b.subType,
          encodedKey: encodeEntityOption(b.entityType, b.subType),
          workflowId: b.workflowId,
          workflowName: wf.name,
          isDefault: wf.isDefault,
        });
      }
    }
    return bindings;
  }, [workflows]);

  const boundKeys = new Set(allBindings.map((b) => b.encodedKey));
  const availableEntityTypes = entityTypeOptions.filter(
    (o) => !boundKeys.has(o.value),
  );

  // Find default workflow
  const defaultWorkflow = workflows.find((wf) => wf.isDefault);

  const handleChangeWorkflow = React.useCallback(
    (entityType: string, subType: string, workflowId: string) => {
      upsertBinding.mutate({ entityType, subType, workflowId });
    },
    [upsertBinding],
  );

  const handleAdd = () => {
    if (!newEncodedType || !newWorkflowId) return;
    const { entityType, subType } = decodeEntityOption(newEncodedType);
    upsertBinding.mutate(
      { entityType, subType, workflowId: newWorkflowId },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          setNewEncodedType("");
          setNewWorkflowId("");
        },
      },
    );
  };

  // ── Column definitions ──
  const columns: ColumnDef<BindingRow, unknown>[] = React.useMemo(
    () => [
      {
        accessorKey: "entityType",
        header: "Loại thực thể",
        meta: { label: "Loại thực thể" },
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-xs font-normal">
            {optionLabel(row.original.encodedKey)}
          </Badge>
        ),
      },
      {
        accessorKey: "workflowId",
        header: "Quy trình soát xét",
        meta: { label: "Quy trình soát xét" },
        cell: ({ row }) => {
          const b = row.original;
          return (
            <Select
              value={b.workflowId}
              onValueChange={(v) => {
                if (v) handleChangeWorkflow(b.entityType, b.subType, v);
              }}
            >
              <SelectTrigger className="h-8 w-[280px] text-xs">
                <span className="flex flex-1 text-left truncate">
                  {workflows.find((wf) => wf.id === b.workflowId)?.name ??
                    b.workflowId}
                </span>
              </SelectTrigger>
              <SelectContent>
                {workflows.map((wf) => {
                  const wfLabel = `${wf.name}${wf.isDefault ? " (mặc định)" : ""}${!wf.isActive ? " (tắt)" : ""}`;
                  return (
                    <SelectItem key={wf.id} value={wf.id} label={wfLabel}>
                      {wfLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        id: "default",
        header: "",
        meta: { label: "Mặc định" },
        cell: ({ row }) => {
          const wf = workflows.find((w) => w.id === row.original.workflowId);
          if (!wf?.isDefault) return null;
          return (
            <Badge variant="default" className="text-[10px] font-normal">
              Quy trình mặc định
            </Badge>
          );
        },
      },
      {
        id: "_actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() =>
              setDeleteTarget({
                entityType: row.original.entityType,
                subType: row.original.subType,
              })
            }
            title="Xóa gán"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [workflows, handleChangeWorkflow],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Gán quy trình soát xét cho từng loại thực thể. Thực thể chưa gán sẽ sử
        dụng quy trình mặc định
        {defaultWorkflow ? (
          <>
            {" "}
            (<span className="font-medium">{defaultWorkflow.name}</span>)
          </>
        ) : (
          <span className="text-amber-600"> (chưa thiết lập)</span>
        )}
        .
      </p>

      <DataTable
        columns={columns}
        data={allBindings}
        isLoading={isLoading}
        emptyMessage="Chưa có gán nào. Tất cả thực thể sẽ sử dụng quy trình mặc định."
        pageSize={10}
        hideToolbar={false}
        actions={
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm gán
          </Button>
        }
      />

      {/* Add binding dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setNewEncodedType("");
            setNewWorkflowId("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm gán thực thể</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Loại thực thể</label>
              <Select
                value={newEncodedType}
                onValueChange={(v) => v && setNewEncodedType(v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <span
                    className={cn(
                      "flex flex-1 text-left truncate",
                      !newEncodedType && "text-muted-foreground",
                    )}
                  >
                    {newEncodedType
                      ? optionLabel(newEncodedType)
                      : "Chọn loại thực thể..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {availableEntityTypes.map((o) => (
                    <SelectItem key={o.value} value={o.value} label={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Quy trình soát xét</label>
              <Select
                value={newWorkflowId}
                onValueChange={(v) => v && setNewWorkflowId(v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <span
                    className={cn(
                      "flex flex-1 text-left truncate",
                      !newWorkflowId && "text-muted-foreground",
                    )}
                  >
                    {newWorkflowId
                      ? (workflows.find((wf) => wf.id === newWorkflowId)
                          ?.name ?? newWorkflowId)
                      : "Chọn quy trình..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {workflows
                    .filter((wf) => wf.isActive)
                    .map((wf) => {
                      const wfLabel = `${wf.name}${wf.isDefault ? " (mặc định)" : ""}`;
                      return (
                        <SelectItem key={wf.id} value={wf.id} label={wfLabel}>
                          {wfLabel}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewEncodedType("");
                setNewWorkflowId("");
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                !newEncodedType || !newWorkflowId || upsertBinding.isPending
              }
            >
              {upsertBinding.isPending && (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              )}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Xóa gán thực thể?"
        description={`Bỏ gán quy trình soát xét khỏi "${deleteTarget ? optionLabel(encodeEntityOption(deleteTarget.entityType, deleteTarget.subType)) : ""}"? Thực thể này sẽ sử dụng quy trình mặc định.`}
        variant="destructive"
        confirmLabel="Xóa gán"
        onConfirm={() => {
          if (deleteTarget) {
            deleteBinding.mutate(deleteTarget, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
        isLoading={deleteBinding.isPending}
      />
    </div>
  );
}
