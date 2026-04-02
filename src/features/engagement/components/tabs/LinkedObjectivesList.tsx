"use client";

import * as React from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useCreateAuditObjective,
  useUpdateAuditObjective,
  useDeleteAuditObjective,
} from "../../hooks/useEngagements";
import type { AuditObjective } from "../../types";

interface LinkedObjectivesListProps {
  objectives: AuditObjective[];
  engagementId: string;
  readOnly?: boolean;
}

export function LinkedObjectivesList({
  objectives,
  engagementId,
  readOnly = false,
}: LinkedObjectivesListProps) {
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<AuditObjective | null>(
    null,
  );

  const createObjective = useCreateAuditObjective();
  const updateObjective = useUpdateAuditObjective();
  const deleteObjective = useDeleteAuditObjective();

  const isEditing = editingId !== null;
  const isSaving = createObjective.isPending || updateObjective.isPending;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (obj: AuditObjective) => {
    setEditingId(obj.id);
    setTitle(obj.title);
    setDescription(obj.description ?? "");
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setShowForm(true);
  };

  const handleSave = () => {
    if (isEditing) {
      updateObjective.mutate(
        {
          engagementId,
          objectiveId: editingId,
          data: {
            title: title.trim(),
            description: description.trim() || null,
          },
        },
        { onSuccess: resetForm },
      );
    } else {
      createObjective.mutate(
        {
          engagementId,
          data: {
            title: title.trim(),
            description: description.trim() || null,
            sortOrder: objectives.length,
          },
        },
        { onSuccess: resetForm },
      );
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteObjective.mutate(
      { engagementId, objectiveId: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) },
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Mục tiêu kiểm toán
      </h3>

      {objectives.length > 0 ? (
        <div className="space-y-1.5">
          {objectives.map((obj, idx) => (
            <div
              key={obj.id}
              className="group flex w-full items-start gap-2 rounded-md border border-muted px-2.5 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <span className="mt-0.5 w-5 shrink-0 text-center text-xs font-medium text-muted-foreground">
                {idx + 1}
              </span>
              <button
                type="button"
                className="flex flex-1 flex-col gap-0.5 text-left"
                onClick={() => !readOnly && handleEdit(obj)}
                disabled={readOnly}
              >
                <span className="text-foreground">{obj.title}</span>
                {obj.description && (
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {obj.description}
                  </span>
                )}
              </button>
              {!readOnly && (
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleEdit(obj)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(obj)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Chưa có mục tiêu kiểm toán.
        </p>
      )}

      {!readOnly && (
        <>
          {!showForm ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={handleAdd}
            >
              <Plus className="mr-1.5 h-3 w-3" />
              Thêm mục tiêu
            </Button>
          ) : (
            <div className="mt-2 space-y-2 rounded-md border p-2">
              <div className="space-y-1">
                <Label className="text-xs">Tên mục tiêu</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tên mục tiêu..."
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && title.trim()) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Mô tả (tùy chọn)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả mục tiêu..."
                  className="min-h-[60px] text-sm"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSave}
                  disabled={!title.trim() || isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isEditing ? (
                    "Cập nhật"
                  ) : (
                    "Lưu"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={resetForm}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa mục tiêu"
        description={`Bạn có chắc chắn muốn xóa mục tiêu "${deleteTarget?.title}"?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteObjective.isPending}
        variant="destructive"
      />
    </div>
  );
}
