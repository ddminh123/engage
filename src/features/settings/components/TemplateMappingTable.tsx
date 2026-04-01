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
  TEMPLATE_ENTITY_TYPES,
  templateEntityTypeLabel,
} from "@/constants/entityTypes";
import {
  useTemplateBindings,
  useUpsertTemplateBinding,
  useDeleteTemplateBinding,
  useTemplates,
} from "../hooks/useTemplates";
import type { TemplateEntityBinding } from "../types";

// ── Main Component ──

export function TemplateMappingTable() {
  const { data: bindings = [], isLoading } = useTemplateBindings();
  const { data: templates = [] } = useTemplates();
  const upsertBinding = useUpsertTemplateBinding();
  const deleteBinding = useDeleteTemplateBinding();

  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [newEntityType, setNewEntityType] = React.useState("");
  const [newTemplateId, setNewTemplateId] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const boundTypes = new Set(bindings.map((b) => b.entityType));
  const availableTypes = TEMPLATE_ENTITY_TYPES.filter(
    (t) => !boundTypes.has(t.value),
  );

  // Active templates only for selection
  const activeTemplates = templates.filter((t) => t.isActive);

  // Filter templates by selected entity type
  const filteredTemplates = newEntityType
    ? activeTemplates.filter((t) => t.entityType === newEntityType)
    : activeTemplates;

  // Handle workflow change inline
  const handleTemplateChange = async (
    entityType: string,
    templateId: string,
  ) => {
    try {
      await upsertBinding.mutateAsync({ entityType, templateId });
    } catch {
      // Error handled by mutation state
    }
  };

  const handleAdd = async () => {
    if (!newEntityType || !newTemplateId) return;
    try {
      await upsertBinding.mutateAsync({
        entityType: newEntityType,
        templateId: newTemplateId,
      });
      setShowAddDialog(false);
      setNewEntityType("");
      setNewTemplateId("");
    } catch {
      // Error handled by mutation state
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBinding.mutateAsync(deleteTarget);
      setDeleteTarget(null);
    } catch {
      // Error handled by mutation state
    }
  };

  // Columns
  const columns: ColumnDef<TemplateEntityBinding>[] = [
    {
      accessorKey: "entityType",
      header: "Loại đối tượng",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs font-normal">
          {templateEntityTypeLabel(row.original.entityType)}
        </Badge>
      ),
    },
    {
      accessorKey: "templateId",
      header: "Mẫu mặc định",
      cell: ({ row }) => {
        const currentTemplateId = row.original.templateId;
        const entityType = row.original.entityType;
        const matchingTemplates = activeTemplates.filter(
          (t) => t.entityType === entityType,
        );

        return (
          <Select
            value={currentTemplateId}
            onValueChange={(v) => {
              if (v) handleTemplateChange(entityType, v);
            }}
          >
            <SelectTrigger className="h-8 w-[280px] text-xs">
              <span
                className={cn(
                  "flex flex-1 text-left truncate",
                  !currentTemplateId && "text-muted-foreground",
                )}
              >
                {currentTemplateId
                  ? (matchingTemplates.find((t) => t.id === currentTemplateId)
                      ?.name ?? row.original.templateName)
                  : "Chọn mẫu"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {matchingTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id} label={t.name}>
                  {t.name}
                </SelectItem>
              ))}
              {matchingTemplates.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Chưa có mẫu nào cho loại này
                </div>
              )}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "templateIsActive",
      header: "Trạng thái mẫu",
      cell: ({ row }) => (
        <Badge
          variant={row.original.templateIsActive ? "default" : "secondary"}
        >
          {row.original.templateIsActive ? "Đang dùng" : "Ngừng"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          title="Gỡ gán"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteTarget(row.original.entityType)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
      meta: { label: "Thao tác" },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={bindings}
        isLoading={isLoading}
        emptyMessage="Chưa có gán mẫu nào. Thêm mới để bắt đầu."
        searchPlaceholder="Tìm..."
        actions={
          <Button
            size="sm"
            className="h-8"
            onClick={() => setShowAddDialog(true)}
            disabled={availableTypes.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm gán mẫu
          </Button>
        }
      />

      {/* ── Add Binding Dialog ── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gán mẫu cho loại đối tượng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Loại đối tượng</label>
              <Select
                value={newEntityType}
                onValueChange={(v) => {
                  setNewEntityType(v ?? "");
                  setNewTemplateId("");
                }}
              >
                <SelectTrigger>
                  <span
                    className={cn(
                      "flex flex-1 text-left truncate",
                      !newEntityType && "text-muted-foreground",
                    )}
                  >
                    {newEntityType
                      ? templateEntityTypeLabel(newEntityType)
                      : "Chọn loại đối tượng"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value} label={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mẫu mặc định</label>
              <Select
                value={newTemplateId}
                onValueChange={(v) => setNewTemplateId(v ?? "")}
              >
                <SelectTrigger>
                  <span
                    className={cn(
                      "flex flex-1 text-left truncate",
                      !newTemplateId && "text-muted-foreground",
                    )}
                  >
                    {newTemplateId
                      ? (filteredTemplates.find((t) => t.id === newTemplateId)
                          ?.name ?? newTemplateId)
                      : "Chọn mẫu"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id} label={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                  {filteredTemplates.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {newEntityType
                        ? "Chưa có mẫu nào cho loại này"
                        : "Chọn loại đối tượng trước"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                !newEntityType || !newTemplateId || upsertBinding.isPending
              }
            >
              {upsertBinding.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Gỡ gán mẫu"
        description={`Bạn có chắc muốn gỡ mẫu mặc định cho "${deleteTarget ? templateEntityTypeLabel(deleteTarget) : ""}"?`}
        confirmLabel="Gỡ"
        onConfirm={handleDelete}
        isLoading={deleteBinding.isPending}
        variant="destructive"
      />
    </>
  );
}
