"use client";

import * as React from "react";
import { Check, X, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InlineInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onExpand?: () => void;
  placeholder?: string;
  icon?: React.ReactNode;
  autoFocus?: boolean;
}

export function InlineInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  onExpand,
  placeholder,
  icon,
  autoFocus,
}: InlineInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="flex flex-1 items-center gap-1.5">
      {icon}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-7 flex-1 text-sm"
        autoFocus={autoFocus}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onSubmit}
        className="shrink-0"
      >
        <Check className="h-3.5 w-3.5" />
      </Button>
      {onExpand && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onExpand}
          className="shrink-0"
          title="Mở form đầy đủ"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onCancel}
        className="shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
