export const API_ROUTES = {
  // Settings module
  SETTINGS: "/api/settings",
  SETTINGS_BY_ID: (id: string) => `/api/settings/${id}`,
  SETTINGS_ORG_UNITS: "/api/settings/org-units",
  SETTINGS_ORG_UNITS_BY_ID: (id: string) => `/api/settings/org-units/${id}`,
  SETTINGS_CONTACTS: "/api/settings/contacts",
  SETTINGS_CONTACTS_BY_ID: (id: string) => `/api/settings/contacts/${id}`,
  SETTINGS_ENTITY_TYPES: "/api/settings/entity-types",
  SETTINGS_ENTITY_TYPES_BY_ID: (id: string) => `/api/settings/entity-types/${id}`,
  SETTINGS_AUDIT_AREAS: "/api/settings/audit-areas",
  SETTINGS_AUDIT_AREAS_BY_ID: (id: string) => `/api/settings/audit-areas/${id}`,

  // Universe module
  UNIVERSE: "/api/universe",
  UNIVERSE_BY_ID: (id: string) => `/api/universe/${id}`,

  // Plan module
  PLAN: "/api/plan",
  PLAN_BY_ID: (id: string) => `/api/plan/${id}`,
  PLAN_AUDITS: (planId: string) => `/api/plan/${planId}/audits`,
  PLAN_AUDIT_BY_ID: (planId: string, auditId: string) => `/api/plan/${planId}/audits/${auditId}`,

  // Engagement module
  ENGAGEMENT: "/api/engagement",
  ENGAGEMENT_BY_ID: (id: string) => `/api/engagement/${id}`,
  ENGAGEMENT_SECTIONS: (id: string) => `/api/engagement/${id}/sections`,
  ENGAGEMENT_SECTION_BY_ID: (id: string, sId: string) => `/api/engagement/${id}/sections/${sId}`,
  ENGAGEMENT_OBJECTIVES: (id: string, sId: string) => `/api/engagement/${id}/sections/${sId}/objectives`,
  ENGAGEMENT_STANDALONE_OBJECTIVES: (id: string) => `/api/engagement/${id}/objectives`,
  ENGAGEMENT_OBJECTIVE_BY_ID: (id: string, oId: string) => `/api/engagement/${id}/objectives/${oId}`,
  ENGAGEMENT_PROCEDURES: (id: string) => `/api/engagement/${id}/procedures`,
  ENGAGEMENT_PROCEDURE_BY_ID: (id: string, pId: string) => `/api/engagement/${id}/procedures/${pId}`,
  ENGAGEMENT_FINDINGS: (id: string) => `/api/engagement/${id}/findings`,
  ENGAGEMENT_FINDING_BY_ID: (id: string, fId: string) => `/api/engagement/${id}/findings/${fId}`,
  ENGAGEMENT_AUDIT_OBJECTIVES: (id: string) => `/api/engagement/${id}/audit-objectives`,
  ENGAGEMENT_AUDIT_OBJECTIVE_BY_ID: (id: string, oId: string) => `/api/engagement/${id}/audit-objectives/${oId}`,
  ENGAGEMENT_RCM_OBJECTIVES: (id: string) => `/api/engagement/${id}/rcm-objectives`,
  ENGAGEMENT_RCM_OBJECTIVE_BY_ID: (id: string, oId: string) => `/api/engagement/${id}/rcm-objectives/${oId}`,
  ENGAGEMENT_RISKS: (id: string) => `/api/engagement/${id}/risks`,
  ENGAGEMENT_RISK_BY_ID: (id: string, rId: string) => `/api/engagement/${id}/risks/${rId}`,
  ENGAGEMENT_CONTROLS: (id: string, rId: string) => `/api/engagement/${id}/risks/${rId}/controls`,
  ENGAGEMENT_CONTROL_BY_ID: (id: string, rId: string, cId: string) => `/api/engagement/${id}/risks/${rId}/controls/${cId}`,
  ENGAGEMENT_REORDER: (id: string) => `/api/engagement/${id}/reorder`,
  ENGAGEMENT_BATCH: (id: string) => `/api/engagement/${id}/batch`,
  ENGAGEMENT_SYNC_RCM_TO_WP: (id: string) => `/api/engagement/${id}/sync-rcm-to-wp`,
  ENGAGEMENT_SYNC_PLANNING_TO_EXEC: (id: string) => `/api/engagement/${id}/sync-planning-to-execution`,
  ENGAGEMENT_MEMBERS: (id: string) => `/api/engagement/${id}/members`,
  ENGAGEMENT_MEMBER_BY_ID: (id: string, userId: string) => `/api/engagement/${id}/members/${userId}`,
  ENGAGEMENT_PROCEDURE_ASSIGNEE: (id: string, pId: string) => `/api/engagement/${id}/procedures/${pId}/assignee`,
  ENGAGEMENT_PLANNING_WORKPAPERS: (id: string) => `/api/engagement/${id}/planning-workpapers`,
  ENGAGEMENT_PLANNING_WORKPAPER_BY_ID: (id: string, wpId: string) => `/api/engagement/${id}/planning-workpapers/${wpId}`,
  ENGAGEMENT_PLANNING_WORKPAPER_VERSIONS: (id: string, wpId: string) => `/api/engagement/${id}/planning-workpapers/${wpId}/versions`,
  ENGAGEMENT_PLANNING_WORKPAPER_VERSION_BY_NUM: (id: string, wpId: string, v: number) => `/api/engagement/${id}/planning-workpapers/${wpId}/versions/${v}`,
  ENGAGEMENT_PLANNING_WORKPAPER_VERSION_RESTORE: (id: string, wpId: string, v: number) => `/api/engagement/${id}/planning-workpapers/${wpId}/versions/${v}/restore`,
  ENGAGEMENT_WP_ASSIGNMENTS: (id: string) => `/api/engagement/${id}/wp-assignments`,
  ENGAGEMENT_WP_SIGNOFFS: (id: string) => `/api/engagement/${id}/wp-signoffs`,
  ENGAGEMENT_WP_COMMENTS: (id: string) => `/api/engagement/${id}/wp-comments`,
  ENGAGEMENT_WP_COMMENT_THREAD: (id: string, threadId: string) => `/api/engagement/${id}/wp-comments/${threadId}`,

  // Versioning & Approval
  ENGAGEMENT_PROCEDURE_PUBLISH: (id: string, pId: string) => `/api/engagement/${id}/procedures/${pId}/publish`,
  ENGAGEMENT_PROCEDURE_VERSIONS: (id: string, pId: string) => `/api/engagement/${id}/procedures/${pId}/versions`,
  ENGAGEMENT_PROCEDURE_VERSION_BY_NUM: (id: string, pId: string, v: number) => `/api/engagement/${id}/procedures/${pId}/versions/${v}`,
  ENGAGEMENT_PROCEDURE_VERSION_RESTORE: (id: string, pId: string, v: number) => `/api/engagement/${id}/procedures/${pId}/versions/${v}/restore`,
  APPROVAL_SIGNOFF_TYPES: (entityType: string) => `/api/approval/${entityType}/signoff-types`,
  APPROVAL_TRANSITIONS: (entityType: string, entityId: string) => `/api/approval/${entityType}/${entityId}/transitions`,
  APPROVAL_EXECUTE_TRANSITION: (entityType: string, entityId: string) => `/api/approval/${entityType}/${entityId}/transition`,
  APPROVAL_AUTO_TRANSITION: (entityType: string, entityId: string) => `/api/approval/${entityType}/${entityId}/auto-transition`,
  APPROVAL_SIGN: (entityType: string, entityId: string) => `/api/approval/${entityType}/${entityId}/sign`,
  APPROVAL_UNSIGN: (entityType: string, entityId: string) => `/api/approval/${entityType}/${entityId}/unsign`,

  // Finding module
  FINDING: "/api/finding",
  FINDING_BY_ID: (id: string) => `/api/finding/${id}`,

  // Teams module
  TEAMS: "/api/teams",
  TEAMS_BY_ID: (id: string) => `/api/teams/${id}`,
  TEAM_MEMBERS: (id: string) => `/api/teams/${id}/members`,
  TEAM_MEMBER_BY_ID: (teamId: string, userId: string) => `/api/teams/${teamId}/members/${userId}`,

  // Users (Settings)
  SETTINGS_USERS: "/api/settings/users",
  SETTINGS_USERS_BY_ID: (id: string) => `/api/settings/users/${id}`,
  SETTINGS_USER_LOCK: (id: string) => `/api/settings/users/${id}/lock`,
  SETTINGS_USER_UNLOCK: (id: string) => `/api/settings/users/${id}/unlock`,

  // Expertise (Settings)
  SETTINGS_EXPERTISE: "/api/settings/expertise",
  SETTINGS_EXPERTISE_BY_ID: (id: string) => `/api/settings/expertise/${id}`,

  // Approval Statuses (Settings)
  SETTINGS_APPROVAL_STATUSES: "/api/settings/approval-statuses",
  SETTINGS_APPROVAL_STATUSES_BY_ID: (id: string) => `/api/settings/approval-statuses/${id}`,

  // Approval Workflows (Settings)
  SETTINGS_APPROVAL_WORKFLOWS: "/api/settings/approval-workflows",
  SETTINGS_APPROVAL_WORKFLOWS_BY_ID: (id: string) => `/api/settings/approval-workflows/${id}`,
  SETTINGS_APPROVAL_WORKFLOW_TRANSITIONS: (id: string) => `/api/settings/approval-workflows/${id}/transitions`,
  SETTINGS_APPROVAL_WORKFLOW_TRANSITION_BY_ID: (id: string, tid: string) => `/api/settings/approval-workflows/${id}/transitions/${tid}`,
  SETTINGS_ENTITY_BINDINGS: "/api/settings/approval-workflows/entity-bindings",

  // Planning Steps (Settings)
  SETTINGS_PLANNING_STEPS: "/api/settings/planning-steps",
  SETTINGS_PLANNING_STEPS_BY_ID: (id: string) => `/api/settings/planning-steps/${id}`,
  SETTINGS_PLANNING_STEPS_REORDER: "/api/settings/planning-steps/reorder",

  // System settings
  SETTINGS_SYSTEM: "/api/settings/system",

  // Template library (Settings)
  SETTINGS_TEMPLATES: "/api/settings/templates",
  SETTINGS_TEMPLATES_BY_ID: (id: string) => `/api/settings/templates/${id}`,
  SETTINGS_TEMPLATE_CATEGORIES: "/api/settings/template-categories",
  SETTINGS_TEMPLATE_BINDINGS: "/api/settings/template-bindings",
  SETTINGS_TEMPLATE_BINDINGS_BY_ENTITY: (entityType: string) => `/api/settings/template-bindings/${entityType}`,
  TEMPLATE_FOR_ENTITY: "/api/templates/for-entity",

  // Document module
  DOCUMENT: "/api/document",
  DOCUMENT_BY_ID: (id: string) => `/api/document/${id}`,
} as const;

export const PAGE_ROUTES = {
  HOME: "/",
  UNIVERSE: "/universe",
  ENTITY_DETAIL: (id: string) => `/universe/${id}`,
  ENTITY_RA_DETAIL: (entityId: string, raId: string) => `/universe/${entityId}/risk-assessments/${raId}`,
  PLAN: "/plan",
  ENGAGEMENT: "/engagement",
  FINDING: "/finding",
  TEAMS: "/teams",
  SETTINGS_USERS: "/settings/users",
  SETTINGS: "/settings",
  CONTACT_DETAIL: (id: string) => `/settings/contacts/${id}`,
  ORG_UNIT_DETAIL: (id: string) => `/settings/org-chart/${id}`,
} as const;
