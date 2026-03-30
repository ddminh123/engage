"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";

interface InlineTableInputProps {
  /** Pre-filled value when editing */
  initialValue?: string;
  /** Called on every keystroke so parent can track current value (e.g. via ref) */
  onChange?: (value: string) => void;
  /** Called when user presses Enter */
  onSubmit?: (value: string) => void;
  /** Called when user presses Escape */
  onCancel?: () => void;
  placeholder?: string;
  /** Icon rendered before the input */
  icon?: React.ReactNode;
  autoFocus?: boolean;
  className?: string;
}

/**
 * A self-contained inline text input for use inside DataTable cells.
 *
 * Manages its own local state so that parent column re-renders
 * (e.g. from useMemo recreation) do NOT break IME composition
 * (Vietnamese Telex/VNI, Chinese Pinyin, Japanese, etc.).
 *
 * Does NOT include confirm/cancel buttons — those belong in the
 * table's _actions column alongside other controls (selectors, etc.).
 */
export function InlineTableInput({
  initialValue = "",
  onChange,
  onSubmit,
  onCancel,
  placeholder,
  icon,
  autoFocus = true,
  className,
}: InlineTableInputProps) {
  const [value, setValue] = useState(initialValue);
  // Synchronous guard: prevents double-fire before React re-renders
  const submittedRef = useRef(false);
  const composingRef = useRef(false);

  const doSubmit = () => {
    if (submittedRef.current || composingRef.current) return;
    submittedRef.current = true;
    onSubmit?.(value);
  };

  return (
    <div className={`flex items-center gap-2 flex-1 ${className ?? ""}`}>
      {icon}
      <Input
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          onChange?.(v);
          // Allow re-submission after editing
          submittedRef.current = false;
        }}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={() => {
          composingRef.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (!composingRef.current) doSubmit();
          }
          if (e.key === "Escape") onCancel?.();
        }}
        placeholder={placeholder}
        className="h-7 flex-1 text-sm"
        autoFocus={autoFocus}
      />
    </div>
  );
}
