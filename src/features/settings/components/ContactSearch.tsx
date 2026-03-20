"use client";

import * as React from "react";
import { SearchableInput } from "@/components/shared/SearchableInput";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import { useContactSearch } from "../hooks/useContacts";
import type { Contact } from "../types";

const LC = SETTINGS_LABELS.contact;
const C = COMMON_LABELS;

interface ContactSearchProps {
  value: Contact | null;
  onChange: (contact: Contact | null) => void;
  onCreateNew: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ContactSearch({
  value,
  onChange,
  onCreateNew,
  placeholder = LC.search,
  disabled,
}: ContactSearchProps) {
  const [query, setQuery] = React.useState("");
  const { data: results = [] } = useContactSearch(query);

  const getSubtitle = (c: Contact) =>
    [c.position, c.email].filter(Boolean).join(" · ") || undefined;

  return (
    <SearchableInput
      value={value}
      onChange={onChange}
      options={results}
      getDisplayValue={(c) => c.name}
      getSubtitle={getSubtitle}
      onQueryChange={setQuery}
      placeholder={placeholder}
      noResultsText={C.table.noData}
      onCreateNew={onCreateNew}
      subtitleBelow
      disabled={disabled}
    />
  );
}
