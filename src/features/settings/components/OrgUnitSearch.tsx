"use client";

import * as React from "react";
import { SearchableInput } from "@/components/shared/SearchableInput";
import { SETTINGS_LABELS } from "@/constants/labels";
import { useOrgUnitSearch } from "../hooks/useOrgUnits";
import type { OrgUnit } from "../types";

const L = SETTINGS_LABELS.orgUnit;

interface OrgUnitSearchProps {
  value: OrgUnit | null;
  onChange: (orgUnit: OrgUnit | null) => void;
  /** Exclude a specific unit from the list (e.g. the unit being edited) */
  excludeId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function OrgUnitSearch({
  value,
  onChange,
  excludeId,
  placeholder = L.placeholder.parent,
  disabled,
}: OrgUnitSearchProps) {
  const [query, setQuery] = React.useState("");
  const { data: results = [] } = useOrgUnitSearch(query);

  const options = excludeId
    ? results.filter((u) => u.id !== excludeId)
    : results;

  return (
    <SearchableInput
      value={value}
      onChange={onChange}
      options={options}
      getDisplayValue={(u) => (u.code ? `${u.name} (${u.code})` : u.name)}
      onQueryChange={setQuery}
      placeholder={placeholder}
      noResultsText={L.noData}
      disabled={disabled}
    />
  );
}
