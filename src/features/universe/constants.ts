// ENTITY_TYPES and AUDIT_AREAS are now dynamic — managed in Settings → Universe
// Use useEntityTypes() and useAuditAreas() hooks to fetch from API

export const AUDIT_CYCLES = [
  'Annual',
  'Biennial',
  'Triennial',
  'Ad-hoc',
  'Continuous',
] as const;

export const ENTITY_STATUSES = ['active', 'inactive', 'archived'] as const;

export const CONTROL_EFFECTIVENESS = ['Strong', 'Medium', 'Weak'] as const;

// ASSESSMENT_SOURCES and RISK_FACTORS are now dynamic — managed in Settings → Universe
// Use useAssessmentSources() and useRiskAssessmentFactors() hooks to fetch from API
