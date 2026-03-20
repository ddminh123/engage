"use client";

import * as React from "react";
import { SearchableInput } from "@/components/shared/SearchableInput";
import { ContactSearch } from "./ContactSearch";
import { ContactCardPopover } from "./ContactCard";
import { COMMON_LABELS } from "@/constants/labels";
import { useContactSearch } from "../hooks/useContacts";
import type { Contact } from "../types";

const C = COMMON_LABELS;

// =============================================================================
// Single-select
// =============================================================================

interface ContactSelectorProps {
  value: Contact | null;
  onChange: (contact: Contact | null) => void;
  onCreateNew?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ContactSelector({
  value,
  onChange,
  onCreateNew,
  placeholder,
  disabled,
}: ContactSelectorProps) {
  return (
    <ContactSearch
      value={value}
      onChange={onChange}
      onCreateNew={onCreateNew ?? (() => {})}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

// =============================================================================
// Multi-select  (same visual style as org unit selector)
// =============================================================================

interface ContactSelectorMultiProps {
  value: Contact[];
  onChange: (contacts: Contact[]) => void;
  onCreateNew?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ContactSelectorMulti({
  value,
  onChange,
  onCreateNew,
  placeholder,
  disabled,
}: ContactSelectorMultiProps) {
  const [query, setQuery] = React.useState("");
  const { data: results = [] } = useContactSearch(query);

  const getSubtitle = (c: Contact) =>
    [c.position, c.email].filter(Boolean).join(" · ") || undefined;

  return (
    <SearchableInput
      multiple
      value={value}
      onChange={onChange}
      options={results}
      getDisplayValue={(c) => c.name}
      getSubtitle={getSubtitle}
      onQueryChange={setQuery}
      placeholder={placeholder}
      noResultsText={C.table.noData}
      onCreateNew={onCreateNew}
      disabled={disabled}
      subtitleBelow
      renderChipLabel={(c) => (
        <ContactCardPopover contact={c}>{c.name}</ContactCardPopover>
      )}
    />
  );
}
