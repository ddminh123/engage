"use client";

import * as React from "react";
import { Check, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface FactorOption {
  id: string;
  name: string;
  description?: string | null;
  isPositive?: boolean;
}

interface FactorPickerProps {
  options: FactorOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

function chipClasses(isPositive?: boolean) {
  if (isPositive === true)
    return "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:text-green-300";
  if (isPositive === false)
    return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300";
  return "";
}

export function FactorPicker({
  options,
  selected,
  onChange,
  placeholder = "+Thêm yếu tố",
  emptyMessage = "Không tìm thấy yếu tố nào.",
  className,
}: FactorPickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const remove = (id: string) => {
    onChange(selected.filter((s) => s !== id));
  };

  const selectedFactors = React.useMemo(
    () =>
      selected
        .map((id) => options.find((o) => o.id === id))
        .filter(Boolean) as FactorOption[],
    [selected, options],
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {/* Selected chips — red for negative, green for positive */}
      {selectedFactors.map((factor) => (
        <Badge
          key={factor.id}
          variant="outline"
          className={cn("gap-1 pr-1", chipClasses(factor.isPositive))}
        >
          {factor.name}
          <button
            type="button"
            onClick={() => remove(factor.id)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Add button — grey chip style, inline at end */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-dashed px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            />
          }
        >
          <Plus className="h-3 w-3" />
          {placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Tìm yếu tố..." />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedSet.has(option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onSelect={() => toggle(option.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex-1 leading-tight">
                        <span className="text-sm">{option.name}</span>
                        {option.description && (
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                      </div>
                      {option.isPositive !== undefined && (
                        <span
                          className={cn(
                            "text-[10px] font-medium",
                            option.isPositive
                              ? "text-green-600"
                              : "text-red-500",
                          )}
                        >
                          {option.isPositive ? "+" : "−"}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
