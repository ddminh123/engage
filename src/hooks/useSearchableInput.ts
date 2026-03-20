import * as React from "react";

interface UseSearchableInputOptions<T> {
  value: T | null;
  getDisplayValue: (item: T) => string;
  onQueryChange?: (query: string) => void;
}

export interface SearchableInputHandle {
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useSearchableInput<T>({
  value,
  getDisplayValue,
  onQueryChange,
}: UseSearchableInputOptions<T>) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // What the input field shows: selected display value when idle, query when searching
  const inputValue = isEditing || !value ? query : getDisplayValue(value);

  const handleFocus = () => {
    setQuery("");
    setIsEditing(true);
    setOpen(true);
    onQueryChange?.("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    onQueryChange?.(q);
  };

  const handleBlur = () => {
    // Delay so mouseDown on dropdown item fires first
    setTimeout(() => {
      setIsEditing(false);
      setOpen(false);
      setQuery("");
      onQueryChange?.("");
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const commitSelect = () => {
    setIsEditing(false);
    setOpen(false);
    setQuery("");
    onQueryChange?.("");
  };

  return {
    query,
    open,
    isEditing,
    inputValue,
    inputRef,
    containerRef,
    handleFocus,
    handleChange,
    handleBlur,
    handleKeyDown,
    commitSelect,
  };
}
