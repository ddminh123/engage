"use client";

import * as React from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Lock,
  FileText,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  usePlanningSteps,
  useCreatePlanningStep,
  useUpdatePlanningStep,
  useDeletePlanningStep,
  useReorderPlanningSteps,
} from "../hooks/usePlanningSteps";
import type { PlanningStepConfig } from "../types";

export function PlanningStepList() {
  const { data: steps = [], isLoading } = usePlanningSteps();
  const createMutation = useCreatePlanningStep();
  const updateMutation = useUpdatePlanningStep();
  const deleteMutation = useDeletePlanningStep();
  const reorderMutation = useReorderPlanningSteps();

  const [newTitle, setNewTitle] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");

  // Drag state
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [orderedSteps, setOrderedSteps] = React.useState<PlanningStepConfig[]>([]);

  React.useEffect(() => {
    setOrderedSteps(steps);
  }, [steps]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    createMutation.mutate(
      { title: newTitle.trim(), step_type: "workpaper" },
      {
        onSuccess: () => {
          setNewTitle("");
          setShowAddForm(false);
        },
      },
    );
  };

  const handleToggleActive = (step: PlanningStepConfig) => {
    updateMutation.mutate({
      id: step.id,
      data: { is_active: !step.isActive },
    });
  };

  const handleStartEdit = (step: PlanningStepConfig) => {
    setEditingId(step.id);
    setEditTitle(step.title);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editTitle.trim()) return;
    updateMutation.mutate(
      { id: editingId, data: { title: editTitle.trim() } },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  // Drag & drop reorder
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setOrderedSteps((prev) => {
      const fromIdx = prev.findIndex((s) => s.id === draggedId);
      const toIdx = prev.findIndex((s) => s.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const handleDragEnd = () => {
    if (!draggedId) return;
    setDraggedId(null);

    const ids = orderedSteps.map((s) => s.id);
    const originalIds = steps.map((s) => s.id);
    const changed = ids.some((id, i) => id !== originalIds[i]);
    if (changed) {
      reorderMutation.mutate(ids);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Step list */}
      <div className="space-y-2">
        {orderedSteps.map((step) => (
          <Card
            key={step.id}
            draggable
            onDragStart={() => handleDragStart(step.id)}
            onDragOver={(e) => handleDragOver(e, step.id)}
            onDragEnd={handleDragEnd}
            className={`transition-opacity ${draggedId === step.id ? "opacity-50" : ""}`}
          >
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground cursor-grab" />

              {step.stepType === "fixed" ? (
                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-blue-500" />
              )}

              {editingId === step.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleSaveEdit}
                    title="Lưu"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingId(null)}
                    title="Hủy"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{step.title}</span>
                  <Badge
                    variant="secondary"
                    className="text-[10px]"
                  >
                    {step.stepType === "fixed" ? "Cố định" : "Tài liệu"}
                  </Badge>
                  {!step.isActive && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Ẩn
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                {editingId !== step.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleStartEdit(step)}
                    title="Đổi tên"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}

                <Switch
                  checked={step.isActive}
                  onCheckedChange={() => handleToggleActive(step)}
                  className="scale-75"
                />

                {step.stepType === "workpaper" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(step.id)}
                    title="Xóa bước"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new step */}
      {showAddForm ? (
        <div className="flex items-center gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Tên bước mới..."
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setShowAddForm(false);
                setNewTitle("");
              }
            }}
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newTitle.trim() || createMutation.isPending}
          >
            Thêm
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowAddForm(false);
              setNewTitle("");
            }}
          >
            Hủy
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Thêm bước kế hoạch
        </Button>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Xóa bước kế hoạch"
        description="Bước kế hoạch này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?"
        variant="destructive"
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
