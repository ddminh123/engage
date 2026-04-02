"use client";

import { useMemo } from "react";
import {
  TEMPLATE_ENTITY_TYPES,
  entityTypeHasSubTypes,
  templateEntityTypeLabel,
} from "@/constants/entityTypes";
import { usePlanningSteps } from "./usePlanningSteps";

export interface EntityTypeOption {
  /** Unique value for select (e.g. "procedure" or "planning_workpaper:understanding") */
  value: string;
  /** Display label */
  label: string;
  /** Actual entity_type for DB */
  entityType: string;
  /** Sub-type key (empty string for base types) */
  subType: string;
}

/** Encode entity_type + sub_type into a single select value */
export function encodeEntityOption(entityType: string, subType: string): string {
  return subType ? `${entityType}:${subType}` : entityType;
}

/** Decode a select value back into entity_type + sub_type */
export function decodeEntityOption(value: string): { entityType: string; subType: string } {
  const idx = value.indexOf(":");
  if (idx === -1) return { entityType: value, subType: "" };
  return { entityType: value.slice(0, idx), subType: value.slice(idx + 1) };
}

/**
 * Builds a flattened list of entity type options, expanding types with sub-types
 * (e.g. planning_workpaper → one entry per planning step).
 *
 * Used in: TemplateMappingTable (binding dialog), TemplateForm, TemplateEditorOverlay.
 */
export function useEntityTypeOptions() {
  const { data: planningSteps = [] } = usePlanningSteps();

  const options = useMemo<EntityTypeOption[]>(() => {
    const result: EntityTypeOption[] = [];

    for (const t of TEMPLATE_ENTITY_TYPES) {
      if (entityTypeHasSubTypes(t.value)) {
        if (t.value === "planning_workpaper") {
          for (const step of planningSteps) {
            result.push({
              value: encodeEntityOption(t.value, step.key),
              label: `${t.label} › ${step.title}`,
              entityType: t.value,
              subType: step.key,
            });
          }
        }
      } else {
        result.push({
          value: t.value,
          label: t.label,
          entityType: t.value,
          subType: "",
        });
      }
    }

    return result;
  }, [planningSteps]);

  /** Resolve a label from encoded value */
  const optionLabel = (value: string) =>
    options.find((o) => o.value === value)?.label ?? templateEntityTypeLabel(value);

  return { options, optionLabel };
}
