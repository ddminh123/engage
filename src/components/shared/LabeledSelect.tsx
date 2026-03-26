"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface LabeledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  renderValue?: (option: SelectOption) => React.ReactNode;
  renderOption?: (option: SelectOption) => React.ReactNode;
}

export function LabeledSelect({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  disabled = false,
  className,
  renderValue,
  renderOption,
}: LabeledSelectProps) {
  const selected = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v ?? "")}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", className)}>
        {selected ? (
          renderValue ? (
            renderValue(selected)
          ) : (
            <span className="truncate">{selected.label}</span>
          )
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} label={opt.label}>
            {renderOption ? renderOption(opt) : opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
