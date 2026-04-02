"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  ArrowUpToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  SortableList,
  DragHandle,
  computeReorder,
  computeMoveToTop,
} from "@/components/shared/SortableList";
import { InlineInput } from "./InlineInput";
import {
  useCreateAuditObjective,
  useUpdateAuditObjective,
  useDeleteAuditObjective,
  useReorderItems,
} from "../../hooks/useEngagements";
import type { AuditObjective } from "../../types";

export interface PendingObjectiveData {
  quote: string;
  selection: { from: number; to: number };
}

interface ObjectivesTabContentProps {
  engagementId: string;
  objectives: AuditObjective[];
  /** Pre-populated from editor context menu selection */
  pendingObjective?: PendingObjectiveData | null;
  /** Called after objective created from selection — apply mark to editor */
  onObjectiveCreated?: (objectiveId: string, from: number, to: number) => void;
  /** Called when pending objective form is cancelled */
  onCancelPendingObjective?: () => void;
  /** Called when an objective row is clicked — scroll to mark in editor */
  onObjectiveClick?: (objectiveId: string) => void;
  /** Called when objective deleted — remove mark from editor */
  onObjectiveDeleted?: (objectiveId: string) => void;
  readOnly?: boolean;
}

export function ObjectivesTabContent({
  engagementId,
  objectives,
  pendingObjective,
  onObjectiveCreated,
  onCancelPendingObjective,
  onObjectiveClick,
  onObjectiveDeleted,
  readOnly = false,
}: ObjectivesTabContentProps) {
  const [addingTitle, setAddingTitle] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<AuditObjective | null>(
    null,
  );

  const createObjective = useCreateAuditObjective();
  const updateObjective = useUpdateAuditObjective();
  const deleteObjective = useDeleteAuditObjective();
  const reorderItems = useReorderItems();

  // Auto-open form when pendingObjective arrives from context menu
  const prevPendingRef = React.useRef<PendingObjectiveData | null | undefined>(
    undefined,
  );
  React.useEffect(() => {
    if (pendingObjective && pendingObjective !== prevPendingRef.current) {
      setEditingId(null);
      setAddingTitle(pendingObjective.quote.slice(0, 200));
      setShowAddForm(true);
    }
    prevPendingRef.current = pendingObjective;
  }, [pendingObjective]);

  const resetAddForm = () => {
    setAddingTitle("");
    setShowAddForm(false);
  };

  const handleCancelAdd = () => {
    const wasPending = !!pendingObjective;
    resetAddForm();
    if (wasPending) {
      onCancelPendingObjective?.();
    }
  };

  const handleAdd = () => {
    if (!addingTitle.trim()) return;
    createObjective.mutate(
      {
        engagementId,
        data: { title: addingTitle.trim() },
      },
      {
        onSuccess: (created) => {
          // If this was from context menu selection, apply the objective mark
          if (pendingObjective && onObjectiveCreated) {
            onObjectiveCreated(
              created.id,
              pendingObjective.selection.from,
              pendingObjective.selection.to,
            );
          }
          resetAddForm();
        },
      },
    );
  };

  const handleStartEdit = (obj: AuditObjective) => {
    setEditingId(obj.id);
    setEditingTitle(obj.title);
  };

  const handleUpdateObjective = (id: string) => {
    if (!editingTitle.trim()) return;
    updateObjective.mutate(
      {
        engagementId,
        objectiveId: id,
        data: { title: editingTitle.trim() },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingTitle("");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    deleteObjective.mutate(
      { engagementId, objectiveId: targetId },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          onObjectiveDeleted?.(targetId);
        },
      },
    );
  };

  const handleReorder = (activeId: string, overId: string) => {
    const newOrder = computeReorder(objectives, activeId, overId);
    if (newOrder.length > 0) {
      reorderItems.mutate({
        engagementId,
        entityType: "audit_objective",
        items: newOrder,
      });
    }
  };

  const handleMoveToTop = (id: string) => {
    const newOrder = computeMoveToTop(objectives, id);
    if (newOrder.length > 0) {
      reorderItems.mutate({
        engagementId,
        entityType: "audit_objective",
        items: newOrder,
      });
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Mục tiêu kiểm toán
      </h3>

      {objectives.length === 0 && !showAddForm && (
        <p className="text-xs text-muted-foreground">Chưa có mục tiêu.</p>
      )}

      {objectives.length > 0 && (
        <SortableList
          items={objectives}
          onReorder={handleReorder}
          renderItem={(obj, dragHandle) => {
            const idx = objectives.findIndex((o) => o.id === obj.id);
            return (
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div className="group/row flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
                    {!readOnly && <DragHandle {...dragHandle} />}
                    <span className="w-5 text-center text-xs text-muted-foreground">
                      {idx + 1}
                    </span>

                    {editingId === obj.id ? (
                      <InlineInput
                        value={editingTitle}
                        onChange={setEditingTitle}
                        onSubmit={() => handleUpdateObjective(obj.id)}
                        onCancel={() => {
                          setEditingId(null);
                          setEditingTitle("");
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          className="flex-1 text-left text-sm hover:text-teal-700 transition-colors"
                          onClick={() => onObjectiveClick?.(obj.id)}
                        >
                          {obj.title}
                        </button>
                        {!readOnly && (
                          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleStartEdit(obj)}
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
                      </>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleMoveToTop(obj.id)}
                    disabled={idx === 0}
                  >
                    <ArrowUpToLine className="mr-2 h-3.5 w-3.5" />
                    Đưa lên đầu
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          }}
        />
      )}

      {!readOnly && !showAddForm && (
        <Button
          variant="outline"
          size="sm"
          className="mt-1"
          onClick={() => {
            setEditingId(null);
            setAddingTitle("");
            setShowAddForm(true);
          }}
        >
          <Plus className="mr-1.5 h-3 w-3" />
          Thêm mục tiêu
        </Button>
      )}

      {showAddForm && (
        <div className="px-2 py-1.5">
          <InlineInput
            value={addingTitle}
            onChange={setAddingTitle}
            onSubmit={handleAdd}
            onCancel={handleCancelAdd}
            placeholder="Tên mục tiêu kiểm toán..."
            icon={<Target className="h-3.5 w-3.5 text-muted-foreground" />}
            autoFocus
          />
        </div>
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
