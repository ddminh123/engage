"use client";

import { Target, ClipboardList, Check, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineTableInput } from "@/components/shared/InlineTableInput";

interface WpInlineAddProps {
  type: "objective" | "procedure";
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  onCancel: () => void;
  textRef: React.RefObject<string>;
  isSaving: boolean;
  placeholder?: string;
  onOpenForm?: () => void;
}

export function WpInlineAdd({
  type,
  onChange,
  onSubmit,
  onCancel,
  textRef,
  isSaving,
  placeholder,
  onOpenForm,
}: WpInlineAddProps) {
  const icon =
    type === "objective" ? (
      <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
    ) : (
      <ClipboardList className="h-3.5 w-3.5 shrink-0 text-violet-500" />
    );

  const defaultPlaceholder =
    type === "objective" ? "Tên mục tiêu..." : "Tên thủ tục...";

  return (
    <div className="flex items-center gap-2 pl-2 py-1">
      {icon}
      <InlineTableInput
        placeholder={placeholder ?? defaultPlaceholder}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
        autoFocus
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onSubmit(textRef.current)}
        disabled={isSaving}
      >
        <Check className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onCancel}
        disabled={isSaving}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
      {onOpenForm && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Mở form đầy đủ"
          onClick={onOpenForm}
          disabled={isSaving}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
