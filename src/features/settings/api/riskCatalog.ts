import { API_ROUTES } from '@/constants';
import { ApiError } from '@/lib/api-error';
import type {
  RiskCatalogDomain,
  RiskCatalogCategory,
  RiskCatalogItem,
  RiskCatalogItemFilters,
  ControlCatalogItem,
  ControlCatalogItemFilters,
  ProcedureCatalogItem,
  ProcedureCatalogItemFilters,
  CopyRisksToEngagementInput,
  CopyControlsToEngagementInput,
} from '../types/riskCatalog';

// =============================================================================
// Helpers
// =============================================================================

interface ApiResponse<T> {
  data: T;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();

  if (!response.ok) {
    const err = json as { error: { code: string; message: string } };
    throw new ApiError(response.status, err.error?.message || 'Request failed', err.error?.code);
  }

  return (json as ApiResponse<T>).data;
}

function buildUrl(base: string, params: URLSearchParams): string {
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

// =============================================================================
// Tree
// =============================================================================

export async function fetchRiskCatalogTree(): Promise<RiskCatalogDomain[]> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_TREE);
  return handleResponse<RiskCatalogDomain[]>(response);
}

// =============================================================================
// Risks
// =============================================================================

export async function fetchRiskCatalogItems(filters?: RiskCatalogItemFilters): Promise<RiskCatalogItem[]> {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.domainId) params.set('domainId', filters.domainId);
  if (filters?.source) params.set('source', filters.source);
  if (filters?.riskType) params.set('riskType', filters.riskType);
  if (filters?.search) params.set('search', filters.search);

  const response = await fetch(buildUrl(API_ROUTES.SETTINGS_RISK_CATALOG_RISKS, params));
  return handleResponse<RiskCatalogItem[]>(response);
}

export async function createRiskCatalogItem(data: Record<string, unknown>): Promise<RiskCatalogItem> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_RISKS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskCatalogItem>(response);
}

export async function updateRiskCatalogItem(id: string, data: Record<string, unknown>): Promise<RiskCatalogItem> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_RISK_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskCatalogItem>(response);
}

export async function deleteRiskCatalogItem(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_RISK_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// Controls
// =============================================================================

export async function fetchControlCatalogItems(filters?: ControlCatalogItemFilters): Promise<ControlCatalogItem[]> {
  const params = new URLSearchParams();
  if (filters?.source) params.set('source', filters.source);
  if (filters?.controlType) params.set('controlType', filters.controlType);
  if (filters?.search) params.set('search', filters.search);

  const response = await fetch(buildUrl(API_ROUTES.SETTINGS_RISK_CATALOG_CONTROLS, params));
  return handleResponse<ControlCatalogItem[]>(response);
}

export async function createControlCatalogItem(data: Record<string, unknown>): Promise<ControlCatalogItem> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_CONTROLS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ControlCatalogItem>(response);
}

export async function updateControlCatalogItem(id: string, data: Record<string, unknown>): Promise<ControlCatalogItem> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_CONTROL_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ControlCatalogItem>(response);
}

export async function deleteControlCatalogItem(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_CONTROL_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// Procedures
// =============================================================================

export async function fetchProcedureCatalogItems(filters?: ProcedureCatalogItemFilters): Promise<ProcedureCatalogItem[]> {
  const params = new URLSearchParams();
  if (filters?.source) params.set('source', filters.source);
  if (filters?.procedureType) params.set('procedureType', filters.procedureType);
  if (filters?.search) params.set('search', filters.search);

  const response = await fetch(buildUrl(API_ROUTES.SETTINGS_RISK_CATALOG_PROCEDURES, params));
  return handleResponse<ProcedureCatalogItem[]>(response);
}

export async function createProcedureCatalogItem(data: Record<string, unknown>): Promise<ProcedureCatalogItem> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_PROCEDURES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ProcedureCatalogItem>(response);
}

export async function updateProcedureCatalogItem(id: string, data: Record<string, unknown>): Promise<ProcedureCatalogItem> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_PROCEDURE_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ProcedureCatalogItem>(response);
}

export async function deleteProcedureCatalogItem(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_PROCEDURE_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// Domains
// =============================================================================

export async function createRiskCatalogDomain(data: Record<string, unknown>): Promise<RiskCatalogDomain> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_DOMAINS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskCatalogDomain>(response);
}

export async function updateRiskCatalogDomain(id: string, data: Record<string, unknown>): Promise<RiskCatalogDomain> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_DOMAIN_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskCatalogDomain>(response);
}

export async function deleteRiskCatalogDomain(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_DOMAIN_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// Categories
// =============================================================================

export async function createRiskCatalogCategory(data: Record<string, unknown>): Promise<RiskCatalogCategory> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_CATEGORIES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskCatalogCategory>(response);
}

export async function updateRiskCatalogCategory(id: string, data: Record<string, unknown>): Promise<RiskCatalogCategory> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_CATEGORY_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskCatalogCategory>(response);
}

export async function deleteRiskCatalogCategory(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.SETTINGS_RISK_CATALOG_CATEGORY_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

// =============================================================================
// Copy to Engagement
// =============================================================================

export async function copyRisksToEngagement(data: CopyRisksToEngagementInput): Promise<{ success: boolean }> {
  const response = await fetch(`${API_ROUTES.SETTINGS_RISK_CATALOG_RISKS}/copy-to-engagement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function copyControlsToEngagement(data: CopyControlsToEngagementInput): Promise<{ success: boolean }> {
  const response = await fetch(`${API_ROUTES.SETTINGS_RISK_CATALOG_CONTROLS}/copy-to-engagement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<{ success: boolean }>(response);
}
