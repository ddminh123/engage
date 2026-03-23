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
