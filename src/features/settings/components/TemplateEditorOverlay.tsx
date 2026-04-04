"use client";

import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  EngageEditor,
  type EngageEditorHandle,
} from "@/components/shared/RichTextEditor/EngageEditor";
import {
  useUpdateTemplate,
  useTemplateCategories,
  useCreateTemplateCategory,
} from "../hooks/useTemplates";
import {
  useEntityTypeOptions,
  decodeEntityOption,
} from "../hooks/useEntityTypeOptions";
import type { Template } from "../types";
import type { JSONContent } from "@tiptap/react";

// ── Auto-save debounce ──

function useTemplateAutoSave(
  templateId: string | null,
  updateMutation: ReturnType<typeof useUpdateTemplate>,
) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const save = React.useCallback(
    (data: Record<string, unknown>) => {
      if (!templateId) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        setStatus("saving");
        try {
          await updateMutation.mutateAsync({ id: templateId, data });
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        } catch {
          setStatus("idle");
        }
      }, 1500);
    },
    [templateId, updateMutation],
  );

  const saveNow = React.useCallback(
    async (data: Record<string, unknown>) => {
      if (!templateId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus("saving");
      try {
        await updateMutation.mutateAsync({ id: templateId, data });
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("idle");
      }
    },
    [templateId, updateMutation],
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { save, saveNow, status };
}

// ── Field Row ──

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Main Component ──

interface TemplateEditorOverlayProps {
  template: Template;
  onClose: () => void;
}

export function TemplateEditorOverlay({
  template,
  onClose,
}: TemplateEditorOverlayProps) {
  const editorRef = React.useRef<EngageEditorHandle>(null);
  const updateMutation = useUpdateTemplate();
  const { data: categories = [] } = useTemplateCategories();
  const createCategoryMutation = useCreateTemplateCategory();
  const autoSave = useTemplateAutoSave(template.id, updateMutation);
  const { options: entityOptions, optionLabel } = useEntityTypeOptions();

  // Local state for metadata
  const [name, setName] = React.useState(template.name);
  const [description, setDescription] = React.useState(
    template.description ?? "",
  );
  const [entityType, setEntityType] = React.useState(template.entityType);
  const [categoryId, setCategoryId] = React.useState(template.categoryId ?? "");
  const [isActive, setIsActive] = React.useState(template.isActive);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [editingTitle, setEditingTitle] = React.useState(false);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  const [localContent, setLocalContent] = React.useState<JSONContent>(
    (template.content as JSONContent) ?? { type: "doc", content: [] },
  );

  // Flatten categories
  const flatCategories = categories.flatMap((cat) => [
    { id: cat.id, name: cat.name },
    ...(cat.children ?? []).map((c) => ({
      id: c.id,
      name: `  └ ${c.name}`,
    })),
  ]);

  // Content change → auto-save
  const handleContentChange = React.useCallback(
    (content: JSONContent) => {
      setLocalContent(content);
      autoSave.save({ content });
    },
    [autoSave],
  );

  // Metadata change → auto-save
  const saveMetadata = React.useCallback(
    (overrides?: Record<string, unknown>) => {
      autoSave.save({
        name,
        description: description || null,
        entity_type: decodeEntityOption(entityType).entityType,
        category_id: categoryId || null,
        is_active: isActive,
        ...overrides,
      });
    },
    [autoSave, name, description, entityType, categoryId, isActive],
  );

  // Title save
  const handleTitleSave = React.useCallback(() => {
    setEditingTitle(false);
    if (name.trim() && name !== template.name) {
      saveMetadata({ name: name.trim() });
    }
  }, [name, template.name, saveMetadata]);

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await createCategoryMutation.mutateAsync({
        name: newCategoryName.trim(),
        parent_id: null,
      });
      setCategoryId(newCat.id);
      setNewCategoryName("");
      autoSave.save({ category_id: newCat.id });
    } catch {
      // Error handled by mutation state
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !editingTitle) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        autoSave.saveNow({ content: localContent });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, editingTitle, autoSave, localContent]);

  // Focus title input when editing
  React.useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* ── Header ── */}
      <div className="shrink-0 border-b bg-background">
        <div className="flex items-center gap-3 px-4 py-2">
          {/* Title */}
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") {
                  setName(template.name);
                  setEditingTitle(false);
                }
              }}
              className="max-w-[400px] min-w-0 shrink text-lg font-semibold bg-transparent border-b-2 border-blue-400 outline-none px-1"
              title="Tên mẫu"
              autoFocus
            />
          ) : (
            <h1
              className="max-w-[400px] min-w-0 shrink text-lg font-semibold truncate cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setEditingTitle(true)}
              title={name}
            >
              {name}
            </h1>
          )}

          <Badge variant="secondary" className="text-xs font-normal shrink-0">
            {optionLabel(entityType)}
          </Badge>

          {/* Save + Auto-save indicator */}
          <div className="flex-1" />
          <Button
            variant="link"
            size="sm"
            className="text-xs"
            onClick={() => autoSave.saveNow({ content: localContent })}
            disabled={autoSave.status === "saving"}
          >
            Lưu
          </Button>
          {autoSave.status === "saving" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Đang lưu...
            </span>
          )}
          {autoSave.status === "saved" && (
            <span className="text-xs text-green-600">Đã lưu</span>
          )}

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
            title="Đóng (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Body: Editor (left) + Metadata (right) ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 overflow-y-auto border-r">
          <EngageEditor
            ref={editorRef}
            content={localContent}
            onChange={handleContentChange}
            editorClassName="min-h-[calc(100vh-200px)]"
          />
        </div>

        {/* Right: Metadata panel */}
        <div className="w-[300px] shrink-0 overflow-y-auto bg-muted/20 p-4 space-y-5">
          <h2 className="text-sm font-semibold">Thông tin mẫu</h2>

          <FieldRow label="Loại đối tượng">
            <Select
              value={entityType}
              onValueChange={(v) => {
                if (v) {
                  setEntityType(v);
                  saveMetadata({
                    entity_type: decodeEntityOption(v).entityType,
                  });
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <span className="flex flex-1 text-left truncate">
                  {optionLabel(entityType)}
                </span>
              </SelectTrigger>
              <SelectContent>
                {entityOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} label={o.label}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Danh mục">
            <Select
              value={categoryId}
              onValueChange={(v) => {
                const val = !v || v === "__none__" ? "" : v;
                setCategoryId(val);
                saveMetadata({ category_id: val || null });
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <span
                  className={cn(
                    "flex flex-1 text-left truncate",
                    !categoryId && "text-muted-foreground",
                  )}
                >
                  {categoryId
                    ? (flatCategories.find((c) => c.id === categoryId)?.name ??
                      categoryId)
                    : "Không có"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" label="Không có">
                  Không có
                </SelectItem>
                {flatCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id} label={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Tạo danh mục mới">
            <div className="flex gap-1.5">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="VD: Planning → IT"
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCategory();
                }}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs shrink-0"
                onClick={handleCreateCategory}
                disabled={
                  !newCategoryName.trim() || createCategoryMutation.isPending
                }
              >
                {createCategoryMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Thêm"
                )}
              </Button>
            </div>
          </FieldRow>

          <FieldRow label="Mô tả">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => saveMetadata()}
              rows={3}
              placeholder="Mô tả ngắn (không bắt buộc)"
              className="text-xs resize-none"
            />
          </FieldRow>

          <FieldRow label="Trạng thái">
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => {
                  setIsActive(checked);
                  autoSave.save({ is_active: checked });
                }}
              />
              <span className="text-xs">
                {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
              </span>
            </div>
          </FieldRow>

          {/* Read-only info */}
          <div className="border-t pt-4 space-y-2">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Người tạo:</span>{" "}
              {template.creatorName ?? "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Tạo lúc:</span>{" "}
              {new Date(template.createdAt).toLocaleDateString("vi-VN")}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Cập nhật:</span>{" "}
              {new Date(template.updatedAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
