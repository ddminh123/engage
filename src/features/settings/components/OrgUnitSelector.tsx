"use client";

import { OrgUnitSearch } from "./OrgUnitSearch";
import type { OrgUnit } from "../types";

interface OrgUnitSelectorProps {
  value: OrgUnit | null;
  onChange: (unit: OrgUnit | null) => void;
  excludeId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function OrgUnitSelector({
  value,
  onChange,
  excludeId,
  placeholder,
  disabled,
}: OrgUnitSelectorProps) {
  return (
    <OrgUnitSearch
      value={value}
      onChange={onChange}
      excludeId={excludeId}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
