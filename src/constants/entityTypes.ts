// =============================================================================
// TEMPLATE ENTITY TYPES — single source of truth for entity types that support templates
// =============================================================================

export const TEMPLATE_ENTITY_TYPES = [
  { value: "procedure", label: "Thủ tục kiểm toán" },
  { value: "planning_workpaper", label: "Giấy tờ kế hoạch", subTypeSource: "planning_step" as const },
  { value: "entity_risk_assessment", label: "Đánh giá rủi ro" },
] as const;

export type TemplateEntityType = (typeof TEMPLATE_ENTITY_TYPES)[number]["value"];

/** Whether an entity type uses sub-types for template binding */
export function entityTypeHasSubTypes(entityType: string): boolean {
  const entry = TEMPLATE_ENTITY_TYPES.find((o) => o.value === entityType);
  return !!(entry && "subTypeSource" in entry && entry.subTypeSource);
}

/** Get the sub-type source identifier for an entity type */
export function getSubTypeSource(entityType: string): string | null {
  const entry = TEMPLATE_ENTITY_TYPES.find((o) => o.value === entityType);
  return entry && "subTypeSource" in entry ? (entry.subTypeSource as string) : null;
}

export const templateEntityTypeLabel = (et: string) =>
  TEMPLATE_ENTITY_TYPES.find((o) => o.value === et)?.label ?? et;
