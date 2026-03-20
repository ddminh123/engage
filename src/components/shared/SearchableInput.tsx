"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

// ── Common props shared by single and multi modes ──
interface CommonProps<T extends { id: string }> {
  /** Options list — provided by parent */
  options: T[];
  /** Primary text in dropdown rows and input display */
  getDisplayValue: (item: T) => string;
  /** Secondary text shown after "·" in both input and dropdown rows */
  getSubtitle?: (item: T) => string | undefined;
  /** Called on every keystroke — disables client-side filtering so parent can drive server search */
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  noResultsText?: string;
  onCreateNew?: () => void;
  className?: string;
  disabled?: boolean;
  /** When true, subtitle renders below the name in dropdown instead of inline */
  subtitleBelow?: boolean;
  /** Returns the parent’s id for an item — enables automatic tree sort + indentation in the dropdown */
  getParentId?: (item: T) => string | null | undefined;
}

// ── Single-select (default) ──
export interface SearchableInputSingleProps<
  T extends { id: string },
> extends CommonProps<T> {
  multiple?: false | undefined;
  value: T | null;
  onChange: (item: T | null) => void;
}

// ── Multi-select ──
export interface SearchableInputMultiProps<
  T extends { id: string },
> extends CommonProps<T> {
  multiple: true;
  value: T[];
  onChange: (items: T[]) => void;
  /** Renders a custom label inside the chip — use to wrap with a Popover trigger or similar */
  renderChipLabel?: (item: T) => React.ReactNode;
}

export type SearchableInputProps<T extends { id: string }> =
  | SearchableInputSingleProps<T>
  | SearchableInputMultiProps<T>;

export function SearchableInput<T extends { id: string }>(
  props: SearchableInputMultiProps<T>,
): React.ReactElement;
export function SearchableInput<T extends { id: string }>(
  props: SearchableInputSingleProps<T>,
): React.ReactElement;
export function SearchableInput<T extends { id: string }>(
  props: SearchableInputProps<T>,
): React.ReactElement {
  if (props.multiple) {
    return <SearchableMulti {...props} />;
  }
  return <SearchableSingle {...props} />;
}

// =============================================================================
// Single-select (original behaviour)
// =============================================================================

function SearchableSingle<T extends { id: string }>({
  value,
  onChange,
  options,
  getDisplayValue,
  getSubtitle,
  onQueryChange,
  placeholder = "Tìm kiếm...",
  noResultsText = "Không tìm thấy kết quả.",
  onCreateNew,
  className,
  disabled = false,
  subtitleBelow,
}: SearchableInputSingleProps<T>) {
  const popupOpen = React.useRef(false);

  const itemToStringLabel = React.useCallback(
    (item: T) => {
      const sub = getSubtitle?.(item);
      return sub ? `${getDisplayValue(item)} · ${sub}` : getDisplayValue(item);
    },
    [getDisplayValue, getSubtitle],
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      popupOpen.current = open;
      if (open) onQueryChange?.("");
    },
    [onQueryChange],
  );

  return (
    <Combobox
      value={value}
      onValueChange={(item) => onChange(item)}
      itemToStringLabel={itemToStringLabel}
      itemToStringValue={(item: T) => item.id}
      isItemEqualToValue={(a: T, b: T) => a.id === b.id}
      onInputValueChange={
        onQueryChange
          ? (v: string) => {
              if (popupOpen.current) onQueryChange(v);
            }
          : undefined
      }
      onOpenChange={handleOpenChange}
      filter={null}
    >
      <div className={cn("flex items-center gap-1", className)}>
        <ComboboxInput
          placeholder={placeholder}
          showClear={!!value}
          disabled={disabled}
          className="flex-1"
        />
        {onCreateNew && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault();
              onCreateNew();
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      <DropdownContent
        options={options}
        getDisplayValue={getDisplayValue}
        getSubtitle={getSubtitle}
        noResultsText={noResultsText}
        subtitleBelow={subtitleBelow}
      />
    </Combobox>
  );
}

// =============================================================================
// Multi-select — standard shadcn Combobox `multiple` with ComboboxChips
// =============================================================================

function treeSort<T extends { id: string }>(
  items: T[],
  getParentId: (item: T) => string | null | undefined,
): { item: T; depth: number }[] {
  const idMap = new Map(items.map((i) => [i.id, i]));
  const childrenOf = new Map<string | null, T[]>();
  for (const item of items) {
    const pid = getParentId(item) ?? null;
    const key = pid && idMap.has(pid) ? pid : null;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(item);
  }
  const result: { item: T; depth: number }[] = [];
  function walk(parentKey: string | null, depth: number) {
    for (const child of childrenOf.get(parentKey) ?? []) {
      result.push({ item: child, depth });
      walk(child.id, depth + 1);
    }
  }
  walk(null, 0);
  return result;
}

function SearchableMulti<T extends { id: string }>({
  value,
  onChange,
  options,
  getDisplayValue,
  getSubtitle,
  onQueryChange,
  placeholder = "Tìm kiếm...",
  noResultsText = "Không tìm thấy kết quả.",
  onCreateNew,
  className,
  disabled = false,
  getParentId,
  renderChipLabel,
}: SearchableInputMultiProps<T>) {
  const sortedOptions = React.useMemo(
    () =>
      getParentId
        ? treeSort(options, getParentId)
        : options.map((item) => ({ item, depth: 0 })),
    [options, getParentId],
  );
  const anchorRef = useComboboxAnchor();

  const itemToStringLabel = React.useCallback(
    (item: T) => {
      const sub = getSubtitle?.(item);
      return sub ? `${getDisplayValue(item)} · ${sub}` : getDisplayValue(item);
    },
    [getDisplayValue, getSubtitle],
  );

  return (
    <Combobox
      multiple
      value={value}
      onValueChange={(items) => onChange(items)}
      itemToStringLabel={itemToStringLabel}
      itemToStringValue={(item: T) => item.id}
      isItemEqualToValue={(a: T, b: T) => a.id === b.id}
      onInputValueChange={
        onQueryChange ? (v: string) => onQueryChange(v) : undefined
      }
      filter={null}
    >
      <div ref={anchorRef} className={cn("flex items-center gap-1", className)}>
        <ComboboxChips className="flex-1">
          <ComboboxValue>
            {value.map((item) => (
              <ComboboxChip key={item.id} showRemove={!disabled}>
                {renderChipLabel
                  ? renderChipLabel(item)
                  : getDisplayValue(item)}
              </ComboboxChip>
            ))}
          </ComboboxValue>
          <ComboboxChipsInput
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
          />
        </ComboboxChips>
        {onCreateNew && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault();
              onCreateNew();
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ComboboxContent anchor={anchorRef}>
        <ComboboxList>
          {options.length === 0 && (
            <div className="py-2 text-center text-sm text-muted-foreground">
              {noResultsText}
            </div>
          )}
          {sortedOptions.map(({ item, depth }) => {
            const sub = getSubtitle?.(item);
            return (
              <ComboboxItem key={item.id} value={item}>
                <span
                  className="truncate"
                  style={
                    depth > 0 ? { paddingLeft: `${depth * 1}rem` } : undefined
                  }
                >
                  {getDisplayValue(item)}
                  {sub && (
                    <span className="text-muted-foreground">
                      {" · "}
                      {sub}
                    </span>
                  )}
                </span>
              </ComboboxItem>
            );
          })}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

// =============================================================================
// Shared dropdown panel
// =============================================================================

function DropdownContent<T extends { id: string }>({
  options,
  getDisplayValue,
  getSubtitle,
  noResultsText,
  anchor,
  subtitleBelow,
}: {
  options: T[];
  getDisplayValue: (item: T) => string;
  getSubtitle?: (item: T) => string | undefined;
  noResultsText: string;
  anchor?: React.RefObject<HTMLDivElement | null>;
  subtitleBelow?: boolean;
}) {
  return (
    <ComboboxContent anchor={anchor}>
      <ComboboxList>
        {options.length === 0 && (
          <div className="py-2 text-center text-sm text-muted-foreground">
            {noResultsText}
          </div>
        )}
        {options.map((item) => {
          const sub = getSubtitle?.(item);
          return (
            <ComboboxItem key={item.id} value={item}>
              {subtitleBelow && sub ? (
                <div className="leading-tight">
                  <div className="font-medium">{getDisplayValue(item)}</div>
                  <div className="text-xs text-muted-foreground">{sub}</div>
                </div>
              ) : (
                <>
                  <span className="font-medium">{getDisplayValue(item)}</span>
                  {sub && (
                    <span className="text-muted-foreground">
                      {" · "}
                      {sub}
                    </span>
                  )}
                </>
              )}
            </ComboboxItem>
          );
        })}
      </ComboboxList>
    </ComboboxContent>
  );
}
