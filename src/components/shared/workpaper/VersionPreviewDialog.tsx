"use client";

import * as React from "react";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EngageEditor } from "@/components/shared/RichTextEditor/EngageEditor";
import { useWorkpaperVersion } from "@/hooks/useWorkpaper";
import { formatTimeAgo } from "@/lib/dateUtils";
import type { JSONContent } from "@tiptap/react";
import type { WpSignoff } from "@/features/engagement/types";

// ── Signoff label map ──

const SIGNOFF_TYPE_LABELS: Record<string, string> = {
  prepare: "Thực hiện",
  review: "Soát xét",
  approve: "Phê duyệt",
};

// ── Snapshot field labels (for procedure and other entity types) ──

const SNAPSHOT_FIELD_LABELS: Record<string, string> = {
  title: "Tiêu đề",
  description: "Mô tả",
  procedures: "Thủ tục",
  procedureType: "Loại thủ tục",
  procedureCategory: "Phân loại",
  status: "Trạng thái",
  observations: "Quan sát",
  conclusion: "Kết luận",
  effectiveness: "Hiệu quả",
  sampleSize: "Cỡ mẫu",
  exceptions: "Ngoại lệ",
  priority: "Ưu tiên",
  reviewNotes: "Ghi chú soát xét",
  performedBy: "Người thực hiện",
  reviewedBy: "Người soát xét",
};

// Fields to exclude from sidebar (rendered in the main area or irrelevant)
const EXCLUDED_FIELDS = new Set(["content"]);

// ── Helpers ──

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFieldValue(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// ── Props ──

interface VersionPreviewDialogProps {
  entityType: string;
  entityId: string;
  engagementId: string;
  /** Version number to preview, or null to close */
  version: number | null;
  onClose: () => void;
  /** If provided, restore button is shown */
  onRestore?: (version: number) => Promise<void>;
  isRestoring?: boolean;
  /** Current version — hides restore for the current version */
  currentVersion?: number;
  /** Signoffs to display per version */
  signoffs?: WpSignoff[];
}

export function VersionPreviewDialog({
  entityType,
  entityId,
  engagementId,
  version,
  onClose,
  onRestore,
  isRestoring = false,
  currentVersion,
  signoffs,
}: VersionPreviewDialogProps) {
  const [confirmRestore, setConfirmRestore] = React.useState(false);

  const { data: detail, isLoading } = useWorkpaperVersion(
    entityType,
    engagementId,
    entityId,
    version,
  );

  // Extract content from snapshot for the editor
  const content = React.useMemo<JSONContent | null>(() => {
    if (!detail?.snapshot?.content) return null;
    return detail.snapshot.content as JSONContent;
  }, [detail]);

  // Extra snapshot fields (everything except content)
  const extraFields = React.useMemo(() => {
    if (!detail?.snapshot) return [];
    return Object.entries(detail.snapshot)
      .filter(([key, val]) => !EXCLUDED_FIELDS.has(key) && val != null && val !== "")
      .map(([key, val]) => ({
        key,
        label: SNAPSHOT_FIELD_LABELS[key] ?? key,
        value: formatFieldValue(val),
      }));
  }, [detail]);

  // Signoffs matching this version
  const versionSignoffs = React.useMemo(() => {
    if (!signoffs?.length || version == null) return [];
    return signoffs.filter(
      (s) => s.version === version && !s.invalidatedAt,
    );
  }, [signoffs, version]);

  const canRestore =
    !!onRestore && version != null && version !== currentVersion;

  const handleRestore = async () => {
    if (version == null || !onRestore) return;
    await onRestore(version);
    setConfirmRestore(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={version !== null}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent size="xl" showCloseButton className="flex flex-col max-h-[85vh] gap-0 p-0">
          {/* ── Header ── */}
          <DialogHeader className="shrink-0 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base">
                  Phiên bản {version}
                </DialogTitle>
                {detail?.actionLabel && (
                  <Badge variant="secondary" className="text-xs">
                    {detail.actionLabel}
                  </Badge>
                )}
                {version === currentVersion && (
                  <Badge variant="outline" className="text-xs">
                    Hiện tại
                  </Badge>
                )}
              </div>
              {canRestore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmRestore(true)}
                  disabled={isRestoring}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Khôi phục
                </Button>
              )}
            </div>
            {detail?.comment && (
              <DialogDescription className="text-xs mt-1">
                {detail.comment}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* ── Body ── */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left: Content preview */}
            <div className="flex-1 overflow-y-auto border-r">
              {isLoading ? (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : content ? (
                <EngageEditor
                  content={content}
                  onChange={() => {}}
                  readOnly
                  editorClassName="min-h-[300px]"
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-muted-foreground">
                  Không có nội dung
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="w-[260px] shrink-0 overflow-y-auto bg-muted/20">
              <div className="p-3 space-y-4">
                {/* Version metadata */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Thông tin phiên bản
                  </h4>
                  {detail ? (
                    <div className="space-y-1.5 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Người tạo</span>
                        <p className="text-sm">{detail.publisher.name}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Thời gian</span>
                        <p className="text-sm">{formatDate(detail.publishedAt)}</p>
                      </div>
                      {detail.versionType && (
                        <div>
                          <span className="text-xs text-muted-foreground">Loại</span>
                          <p className="text-sm">
                            {detail.versionType === "manual"
                              ? "Lưu thủ công"
                              : detail.versionType === "transition"
                                ? "Chuyển trạng thái"
                                : detail.versionType}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : isLoading ? (
                    <p className="text-xs text-muted-foreground">Đang tải...</p>
                  ) : null}
                </div>

                {/* Signoffs at this version */}
                {versionSignoffs.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Ký duyệt
                      </h4>
                      <div className="space-y-1">
                        {versionSignoffs.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-1.5 text-sm"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              {SIGNOFF_TYPE_LABELS[s.signoffType] ?? s.signoffType}:
                            </span>
                            <span className="text-xs truncate">
                              {s.user.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Extra snapshot fields (procedure metadata, etc.) */}
                {extraFields.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Dữ liệu phiên bản
                      </h4>
                      <div className="space-y-2">
                        {extraFields.map((f) => (
                          <div key={f.key}>
                            <span className="text-xs text-muted-foreground">
                              {f.label}
                            </span>
                            <p className="text-xs whitespace-pre-wrap break-words mt-0.5 max-h-24 overflow-y-auto">
                              {f.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore confirmation */}
      <ConfirmDialog
        open={confirmRestore}
        onOpenChange={setConfirmRestore}
        title="Khôi phục phiên bản"
        description={`Khôi phục nội dung về phiên bản ${version}? Trạng thái phê duyệt sẽ được đặt lại.`}
        onConfirm={handleRestore}
        variant="confirm"
        confirmLabel="Khôi phục"
        isLoading={isRestoring}
        loadingLabel="Đang khôi phục..."
      />
    </>
  );
}
