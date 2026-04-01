import { API_ROUTES } from '@/constants';
import type {
  Contact,
  ContactInput,
  OrgUnit,
  OrgUnitCreateInput,
  OrgUnitUpdateInput,
  OrgUnitFilters,
  EntityType,
  EntityTypeInput,
  AuditArea,
  AuditAreaInput,
  Template,
  TemplateInput,
  TemplateCategory,
  TemplateCategoryInput,
  TemplateEntityBinding,
  TemplateEntityBindingInput,
  TemplateForEntity,
  ApprovalWorkflow,
  ApprovalWorkflowInput,
  ApprovalWorkflowUpdateInput,
  ApprovalWorkflowTransition,
  ApprovalTransitionInput,
  ApprovalEntityBinding,
  EntityBindingInput,
  PlanningStepConfig,
  PlanningStepConfigInput,
  PlanningStepConfigUpdateInput,
  ApprovalStatusItem,
  ApprovalStatusInput,
  ApprovalStatusUpdateInput,
} from './types';

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();

  if (!response.ok) {
    const error = json as ApiError;
    throw new Error(error.error?.message || 'Request failed');
  }

  return (json as ApiResponse<T>).data;
}

export async function fetchOrgUnits(filters?: OrgUnitFilters): Promise<OrgUnit[]> {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set('status', filters.status);
  }
  if (filters?.search) {
    params.set('search', filters.search);
  }
  if (filters?.parentId !== undefined) {
    params.set('parentId', filters.parentId ?? '');
  }

  const url = `${API_ROUTES.SETTINGS_ORG_UNITS}${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  return handleResponse<OrgUnit[]>(response);
}

export async function fetchOrgUnitById(id: string): Promise<OrgUnit> {
  const response = await fetch(API_ROUTES.SETTINGS_ORG_UNITS_BY_ID(id));
  return handleResponse<OrgUnit>(response);
}

export async function createOrgUnit(
  data: OrgUnitCreateInput
): Promise<OrgUnit> {
  const response = await fetch(API_ROUTES.SETTINGS_ORG_UNITS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<OrgUnit>(response);
}

export async function updateOrgUnit(
  id: string,
  data: OrgUnitUpdateInput
): Promise<OrgUnit> {
  const response = await fetch(API_ROUTES.SETTINGS_ORG_UNITS_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<OrgUnit>(response);
}

export async function deleteOrgUnit(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_ORG_UNITS_BY_ID(id), {
    method: 'DELETE',
  });

  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// CONTACTS
// =============================================================================

export async function fetchContacts(query?: string): Promise<Contact[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);

  const url = `${API_ROUTES.SETTINGS_CONTACTS}${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  return handleResponse<Contact[]>(response);
}

export async function fetchContactById(id: string): Promise<Contact> {
  const response = await fetch(API_ROUTES.SETTINGS_CONTACTS_BY_ID(id));
  return handleResponse<Contact>(response);
}

export async function searchContacts(query: string): Promise<Contact[]> {
  const params = new URLSearchParams();
  params.set('mode', 'search');
  if (query) params.set('q', query);

  const url = `${API_ROUTES.SETTINGS_CONTACTS}?${params}`;
  const response = await fetch(url);

  return handleResponse<Contact[]>(response);
}

export async function createContactApi(data: ContactInput): Promise<Contact> {
  const response = await fetch(API_ROUTES.SETTINGS_CONTACTS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<Contact>(response);
}

export async function updateContactApi(
  id: string,
  data: ContactInput,
): Promise<Contact> {
  const response = await fetch(API_ROUTES.SETTINGS_CONTACTS_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<Contact>(response);
}

export async function deleteContactApi(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_CONTACTS_BY_ID(id), {
    method: 'DELETE',
  });

  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// ENTITY TYPES
// =============================================================================

export async function fetchEntityTypes(includeInactive = false): Promise<EntityType[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.set('includeInactive', 'true');

  const url = `${API_ROUTES.SETTINGS_ENTITY_TYPES}${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  return handleResponse<EntityType[]>(response);
}

export async function createEntityTypeApi(data: EntityTypeInput): Promise<EntityType> {
  const response = await fetch(API_ROUTES.SETTINGS_ENTITY_TYPES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<EntityType>(response);
}

export async function updateEntityTypeApi(
  id: string,
  data: Partial<EntityTypeInput>,
): Promise<EntityType> {
  const response = await fetch(API_ROUTES.SETTINGS_ENTITY_TYPES_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<EntityType>(response);
}

export async function deleteEntityTypeApi(id: string): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.SETTINGS_ENTITY_TYPES_BY_ID(id), {
    method: 'DELETE',
  });

  return handleResponse<{ id: string }>(response);
}

// =============================================================================
// AUDIT AREAS
// =============================================================================

export async function fetchAuditAreas(includeInactive = false): Promise<AuditArea[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.set('includeInactive', 'true');

  const url = `${API_ROUTES.SETTINGS_AUDIT_AREAS}${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  return handleResponse<AuditArea[]>(response);
}

export async function createAuditAreaApi(data: AuditAreaInput): Promise<AuditArea> {
  const response = await fetch(API_ROUTES.SETTINGS_AUDIT_AREAS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<AuditArea>(response);
}

export async function updateAuditAreaApi(
  id: string,
  data: Partial<AuditAreaInput>,
): Promise<AuditArea> {
  const response = await fetch(API_ROUTES.SETTINGS_AUDIT_AREAS_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<AuditArea>(response);
}

export async function deleteAuditAreaApi(id: string): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.SETTINGS_AUDIT_AREAS_BY_ID(id), {
    method: 'DELETE',
  });

  return handleResponse<{ id: string }>(response);
}

// =============================================================================
// TEMPLATE CATEGORIES
// =============================================================================

export async function fetchTemplateCategories(): Promise<TemplateCategory[]> {
  const response = await fetch(API_ROUTES.SETTINGS_TEMPLATE_CATEGORIES);
  return handleResponse<TemplateCategory[]>(response);
}

export async function createTemplateCategoryApi(data: TemplateCategoryInput): Promise<TemplateCategory> {
  const response = await fetch(API_ROUTES.SETTINGS_TEMPLATE_CATEGORIES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<TemplateCategory>(response);
}

// =============================================================================
// TEMPLATES
// =============================================================================

export async function fetchTemplates(filters?: {
  entityType?: string;
  categoryId?: string;
  isActive?: boolean;
}): Promise<Template[]> {
  const params = new URLSearchParams();
  if (filters?.entityType) params.set('entityType', filters.entityType);
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));

  const url = `${API_ROUTES.SETTINGS_TEMPLATES}${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  return handleResponse<Template[]>(response);
}

export async function fetchTemplateById(id: string): Promise<Template> {
  const response = await fetch(API_ROUTES.SETTINGS_TEMPLATES_BY_ID(id));
  return handleResponse<Template>(response);
}

export async function createTemplateApi(data: TemplateInput): Promise<Template> {
  const response = await fetch(API_ROUTES.SETTINGS_TEMPLATES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Template>(response);
}

export async function updateTemplateApi(id: string, data: Partial<TemplateInput>): Promise<Template> {
  const response = await fetch(API_ROUTES.SETTINGS_TEMPLATES_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Template>(response);
}

export async function deleteTemplateApi(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_TEMPLATES_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

// ── Approval Workflows ──

export async function fetchApprovalWorkflowsApi(): Promise<ApprovalWorkflow[]> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_WORKFLOWS);
  return handleResponse<ApprovalWorkflow[]>(response);
}

export async function fetchApprovalWorkflowApi(id: string): Promise<ApprovalWorkflow> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_WORKFLOWS_BY_ID(id));
  return handleResponse<ApprovalWorkflow>(response);
}

export async function createApprovalWorkflowApi(data: ApprovalWorkflowInput): Promise<ApprovalWorkflow> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_WORKFLOWS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApprovalWorkflow>(response);
}

export async function updateApprovalWorkflowApi(id: string, data: ApprovalWorkflowUpdateInput): Promise<ApprovalWorkflow> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_WORKFLOWS_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApprovalWorkflow>(response);
}

export async function deleteApprovalWorkflowApi(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_WORKFLOWS_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function addApprovalTransitionApi(workflowId: string, data: ApprovalTransitionInput): Promise<ApprovalWorkflowTransition> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_WORKFLOW_TRANSITIONS(workflowId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApprovalWorkflowTransition>(response);
}

export async function updateApprovalTransitionApi(workflowId: string, transitionId: string, data: Partial<ApprovalTransitionInput>): Promise<ApprovalWorkflowTransition> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_WORKFLOW_TRANSITION_BY_ID(workflowId, transitionId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApprovalWorkflowTransition>(response);
}

export async function reorderApprovalTransitionsApi(workflowId: string, orderedIds: string[]): Promise<ApprovalWorkflow> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_WORKFLOW_TRANSITIONS(workflowId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
  return handleResponse<ApprovalWorkflow>(response);
}

export async function deleteApprovalTransitionApi(workflowId: string, transitionId: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_WORKFLOW_TRANSITION_BY_ID(workflowId, transitionId), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// APPROVAL STATUSES
// =============================================================================

export async function fetchApprovalStatusesApi(): Promise<ApprovalStatusItem[]> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_STATUSES);
  return handleResponse<ApprovalStatusItem[]>(response);
}

export async function createApprovalStatusApi(data: ApprovalStatusInput): Promise<ApprovalStatusItem> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_STATUSES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApprovalStatusItem>(response);
}

export async function updateApprovalStatusApi(id: string, data: ApprovalStatusUpdateInput): Promise<ApprovalStatusItem> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_STATUSES_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApprovalStatusItem>(response);
}

export async function deleteApprovalStatusApi(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_STATUSES_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function restoreApprovalStatusApi(id: string): Promise<ApprovalStatusItem> {
  const response = await fetch(API_ROUTES.SETTINGS_APPROVAL_STATUSES_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restore: true }),
  });
  return handleResponse<ApprovalStatusItem>(response);
}

// =============================================================================
// TEMPLATE ENTITY BINDINGS
// =============================================================================

export async function fetchTemplateBindingsApi(): Promise<TemplateEntityBinding[]> {
  const response = await fetch(API_ROUTES.SETTINGS_TEMPLATE_BINDINGS);
  return handleResponse<TemplateEntityBinding[]>(response);
}

export async function upsertTemplateBindingApi(data: TemplateEntityBindingInput): Promise<TemplateEntityBinding> {
  const response = await fetch(API_ROUTES.SETTINGS_TEMPLATE_BINDINGS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<TemplateEntityBinding>(response);
}

export async function deleteTemplateBindingApi(entityType: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_TEMPLATE_BINDINGS_BY_ENTITY(entityType), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function fetchTemplateForEntityApi(entityType: string): Promise<TemplateForEntity | null> {
  const response = await fetch(`${API_ROUTES.TEMPLATE_FOR_ENTITY}?entityType=${encodeURIComponent(entityType)}`);
  return handleResponse<TemplateForEntity | null>(response);
}

// =============================================================================
// ENTITY BINDINGS (Approval Workflow)
// =============================================================================

export async function upsertEntityBindingApi(data: EntityBindingInput): Promise<ApprovalEntityBinding> {
  const response = await fetch(API_ROUTES.SETTINGS_ENTITY_BINDINGS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApprovalEntityBinding>(response);
}

export async function deleteEntityBindingApi(entityType: string): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_ROUTES.SETTINGS_ENTITY_BINDINGS}?entityType=${encodeURIComponent(entityType)}`,
    { method: 'DELETE' },
  );
  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// PLANNING STEP CONFIG
// =============================================================================

export async function fetchPlanningStepsApi(): Promise<PlanningStepConfig[]> {
  const response = await fetch(API_ROUTES.SETTINGS_PLANNING_STEPS);
  return handleResponse<PlanningStepConfig[]>(response);
}

export async function createPlanningStepApi(data: PlanningStepConfigInput): Promise<PlanningStepConfig> {
  const response = await fetch(API_ROUTES.SETTINGS_PLANNING_STEPS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<PlanningStepConfig>(response);
}

export async function updatePlanningStepApi(id: string, data: PlanningStepConfigUpdateInput): Promise<PlanningStepConfig> {
  const response = await fetch(API_ROUTES.SETTINGS_PLANNING_STEPS_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<PlanningStepConfig>(response);
}

export async function deletePlanningStepApi(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_PLANNING_STEPS_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function reorderPlanningStepsApi(orderedIds: string[]): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_PLANNING_STEPS_REORDER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// System Settings
// =============================================================================

export async function fetchSystemSettingsApi(): Promise<Record<string, unknown>> {
  const response = await fetch(API_ROUTES.SETTINGS_SYSTEM);
  return handleResponse<Record<string, unknown>>(response);
}

export async function fetchSystemSettingApi(key: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_ROUTES.SETTINGS_SYSTEM}?key=${encodeURIComponent(key)}`);
  return handleResponse<Record<string, unknown>>(response);
}

export async function updateSystemSettingsApi(settings: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch(API_ROUTES.SETTINGS_SYSTEM, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  });
  return handleResponse<Record<string, unknown>>(response);
}
