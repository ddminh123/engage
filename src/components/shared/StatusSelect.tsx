"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface StatusOption {
  value: string;
  label: string;
  color?: string;
}

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly StatusOption[];
  placeholder?: string;
  className?: string;
}

function StatusDot({ color }: { color?: string }) {
  if (!color) return null;
  return (
    <span className={cn("inline-block h-2 w-2 rounded-full shrink-0", color)} />
  );
}

export function StatusSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: StatusSelectProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(v);
      }}
    >
      <SelectTrigger className={cn("w-auto min-w-[120px]", className)}>
        <SelectValue placeholder={placeholder}>
          {selected && (
            <span className="flex items-center gap-2">
              <StatusDot color={selected.color} />
              {selected.label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <StatusDot color={option.color} />
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
