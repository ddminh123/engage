"use client";

import * as React from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn } from "@/lib/utils";
import {
  useCreateFinding,
  useUpdateFinding,
  useDeleteFinding,
} from "../../hooks/useEngagements";

interface LinkedFinding {
  id: string;
  title: string;
  riskRating: string | null;
  description?: string | null;
  evidence?: string | null;
}

export interface PendingFindingData {
  quote: string;
  selection: { from: number; to: number };
}

interface LinkedFindingsListProps {
  findings: LinkedFinding[];
  engagementId: string;
  procedureId: string;
  /** Pre-populated from editor context menu selection */
  pendingFinding?: PendingFindingData | null;
  /** Called after a finding is successfully created from the editor context menu */
  onFindingCreated?: (findingId: string, from: number, to: number) => void;
  /** Called when pending finding form is cancelled */
  onCancelPendingFinding?: () => void;
  /** Called when a finding row is clicked (for scroll-to-mark behavior) */
  onFindingClick?: (findingId: string) => void;
  /** Called when a finding is deleted (to remove editor mark) */
  onFindingDeleted?: (findingId: string) => void;
}

const RISK_RATING_OPTIONS = [
  { value: "", label: "— Chọn —" },
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "critical", label: "Nghiêm trọng" },
];

const RISK_RATING_LABELS: Record<string, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  critical: "Nghiêm trọng",
};

export function LinkedFindingsList({
  findings,
  engagementId,
  procedureId,
  pendingFinding,
  onFindingCreated,
  onCancelPendingFinding,
  onFindingClick,
  onFindingDeleted,
}: LinkedFindingsListProps) {
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [rating, setRating] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [evidence, setEvidence] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<LinkedFinding | null>(
    null,
  );

  const createFinding = useCreateFinding();
  const updateFinding = useUpdateFinding();
  const deleteFinding = useDeleteFinding();

  const isEditing = editingId !== null;
  const isSaving = createFinding.isPending || updateFinding.isPending;

  // Auto-open form when pendingFinding arrives from context menu
  const prevPendingRef = React.useRef<PendingFindingData | null | undefined>(undefined);
  React.useEffect(() => {
    if (pendingFinding && pendingFinding !== prevPendingRef.current) {
      setEditingId(null);
      setTitle(pendingFinding.quote.slice(0, 100));
      setRating("");
      setDescription("");
      setEvidence(pendingFinding.quote);
      setShowForm(true);
    }
    prevPendingRef.current = pendingFinding;
  }, [pendingFinding]);

  const resetForm = () => {
    setTitle("");
    setRating("");
    setDescription("");
    setEvidence("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    const wasPending = !!pendingFinding;
    resetForm();
    if (wasPending) {
      onCancelPendingFinding?.();
    }
  };

  const handleEdit = (f: LinkedFinding) => {
    setEditingId(f.id);
    setTitle(f.title);
    setRating(f.riskRating ?? "");
    setDescription(f.description ?? "");
    setEvidence(f.evidence ?? "");
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setTitle("");
    setRating("");
    setDescription("");
    setEvidence("");
    setShowForm(true);
  };

  const handleSave = () => {
    if (isEditing) {
      updateFinding.mutate(
        {
          engagementId,
          findingId: editingId,
          data: {
            title: title.trim(),
            riskRating: rating || null,
            description: description.trim() || null,
            evidence: evidence.trim() || null,
          },
        },
        { onSuccess: resetForm },
      );
    } else {
      createFinding.mutate(
        {
          engagementId,
          data: {
            title: title.trim(),
            riskRating: rating || null,
            description: description.trim() || null,
            evidence: evidence.trim() || null,
            procedureIds: [procedureId],
          },
        },
        {
          onSuccess: (createdFinding) => {
            // If this was from context menu selection, apply the finding mark
            if (pendingFinding && onFindingCreated) {
              onFindingCreated(
                createdFinding.id,
                pendingFinding.selection.from,
                pendingFinding.selection.to,
              );
            }
            resetForm();
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    deleteFinding.mutate(
      { engagementId, findingId: targetId },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          onFindingDeleted?.(targetId);
        },
      },
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Phát hiện liên quan
      </h3>

      {findings.length > 0 ? (
        <div className="space-y-1.5">
          {findings.map((f) => (
            <div
              key={f.id}
              className="group flex w-full items-center gap-2 rounded-md border border-muted px-2.5 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <button
                type="button"
                className="flex flex-1 items-center gap-2 text-left"
                onClick={() => {
                  onFindingClick?.(f.id);
                  handleEdit(f);
                }}
              >
                <span className="flex-1 text-foreground">{f.title}</span>
                {f.riskRating && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] shrink-0",
                      f.riskRating === "critical" &&
                        "border-red-300 bg-red-50 text-red-700",
                      f.riskRating === "high" &&
                        "border-orange-300 bg-orange-50 text-orange-700",
                      f.riskRating === "medium" &&
                        "border-yellow-300 bg-yellow-50 text-yellow-700",
                      f.riskRating === "low" &&
                        "border-green-300 bg-green-50 text-green-700",
                    )}
                  >
                    {RISK_RATING_LABELS[f.riskRating] ?? f.riskRating}
                  </Badge>
                )}
              </button>
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleEdit(f)}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(f)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Chưa có phát hiện.</p>
      )}

      {!showForm ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-1"
          onClick={handleAdd}
        >
          <Plus className="mr-1.5 h-3 w-3" />
          Thêm phát hiện
        </Button>
      ) : (
        <div className="mt-2 space-y-2 rounded-md border p-2">
          {pendingFinding && !isEditing && (
            <div className="rounded bg-violet-50 px-2 py-1 text-xs text-violet-700 border border-violet-200">
              Tạo phát hiện từ văn bản đã chọn
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Tiêu đề</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mức độ rủi ro</Label>
            <LabeledSelect
              value={rating}
              onChange={setRating}
              options={RISK_RATING_OPTIONS}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mô tả (tùy chọn)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả phát hiện..."
              className="min-h-[60px] text-sm"
              rows={2}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bằng chứng (tùy chọn)</Label>
            <Textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Bằng chứng liên quan..."
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
              onClick={handleCancel}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa phát hiện"
        description={`Bạn có chắc chắn muốn xóa phát hiện "${deleteTarget?.title}"?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteFinding.isPending}
        variant="destructive"
      />
    </div>
  );
}
