"use client";

import * as React from "react";
import { FileText, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RichTextEditor,
  RichTextDisplay,
} from "@/components/shared/RichTextEditor";
import {
  useGetOrCreatePlanningWorkpaper,
  useUpdatePlanningWorkpaper,
} from "../../hooks/usePlanningWorkpapers";
import { useStatusMap } from "@/features/settings/hooks/useApprovalStatuses";

interface PlanningWorkpaperCardProps {
  engagementId: string;
  stepConfigId: string;
  stepTitle: string;
  /** Pre-loaded workpaper data if already fetched */
  workpaper?: {
    id: string;
    content: unknown;
    approvalStatus: string;
  } | null;
}

export function PlanningWorkpaperCard({
  engagementId,
  stepConfigId,
  stepTitle,
  workpaper: preloaded,
}: PlanningWorkpaperCardProps) {
  const getOrCreate = useGetOrCreatePlanningWorkpaper(engagementId);
  const updateWp = useUpdatePlanningWorkpaper(engagementId);
  const statusMap = useStatusMap();

  const [isEditing, setIsEditing] = React.useState(false);
  const [html, setHtml] = React.useState("");
  const [wpId, setWpId] = React.useState<string | null>(preloaded?.id ?? null);
  const [initialContent, setInitialContent] = React.useState<string>(
    preloaded?.content ? convertToHtml(preloaded.content) : "",
  );
  const [approvalStatus, setApprovalStatus] = React.useState<string>(
    preloaded?.approvalStatus ?? "not_started",
  );

  // Sync preloaded data
  React.useEffect(() => {
    if (preloaded) {
      setWpId(preloaded.id);
      setInitialContent(convertToHtml(preloaded.content));
      setApprovalStatus(preloaded.approvalStatus);
    }
  }, [preloaded]);

  const handleStartEdit = React.useCallback(() => {
    if (!wpId) {
      // Lazy create
      getOrCreate.mutate(stepConfigId, {
        onSuccess: (data) => {
          setWpId(data.id);
          setInitialContent(convertToHtml(data.content));
          setHtml(convertToHtml(data.content));
          setIsEditing(true);
        },
      });
    } else {
      setHtml(initialContent);
      setIsEditing(true);
    }
  }, [wpId, stepConfigId, getOrCreate, initialContent]);

  const handleSave = React.useCallback(() => {
    if (!wpId) return;
    updateWp.mutate(
      { wpId, content: html },
      {
        onSuccess: () => {
          setInitialContent(html);
          setIsEditing(false);
        },
      },
    );
  }, [wpId, html, updateWp]);

  const handleCancel = () => {
    setIsEditing(false);
    setHtml(initialContent);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {statusMap.get(approvalStatus)?.label ?? approvalStatus}
          </Badge>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleStartEdit}
            disabled={getOrCreate.isPending}
          >
            {getOrCreate.isPending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <FileText className="mr-1 h-3 w-3" />
            )}
            {initialContent ? "Sửa" : "Bắt đầu soạn"}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <RichTextEditor
            content={html}
            onChange={setHtml}
            placeholder={`Nhập nội dung ${stepTitle}...`}
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateWp.isPending}
            >
              {updateWp.isPending && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              <Save className="mr-1 h-3 w-3" />
              Lưu
            </Button>
          </div>
        </div>
      ) : initialContent ? (
        <RichTextDisplay content={initialContent} />
      ) : (
        <p className="text-sm text-muted-foreground py-2">
          Chưa có nội dung. Nhấn &quot;Bắt đầu soạn&quot; để tạo.
        </p>
      )}
    </div>
  );
}

/** Convert Tiptap JSON or HTML string content to HTML string */
function convertToHtml(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  // For JSON content, return empty — we store as HTML string
  return "";
}
