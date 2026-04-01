// =============================================================================
// TEMPLATE ENTITY TYPES — single source of truth for entity types that support templates
// =============================================================================

export const TEMPLATE_ENTITY_TYPES = [
  { value: "procedure", label: "Thủ tục kiểm toán" },
  { value: "planning_workpaper", label: "Giấy tờ kế hoạch" },
  { value: "entity_risk_assessment", label: "Đánh giá rủi ro" },
] as const;

export type TemplateEntityType = (typeof TEMPLATE_ENTITY_TYPES)[number]["value"];

export const templateEntityTypeLabel = (et: string) =>
  TEMPLATE_ENTITY_TYPES.find((o) => o.value === et)?.label ?? et;
