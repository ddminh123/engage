import { API_ROUTES } from '@/constants';
import { ApiError } from '@/lib/api-error';
import type { AuditableEntity, EntityInput, RiskAssessment, RiskAssessmentInput, RiskAssessmentFactor, RiskAssessmentFactorInput, AssessmentSource, AssessmentSourceInput, RiskCatalogueItem, RiskCatalogueItemInput, EntityRisk, EntityRiskInput } from './types';

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

// ── Entity CRUD ──

export async function fetchEntities(query?: string): Promise<AuditableEntity[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);

  const url = `${API_ROUTES.UNIVERSE}${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  return handleResponse<AuditableEntity[]>(response);
}

export async function fetchEntityById(id: string): Promise<AuditableEntity> {
  const response = await fetch(API_ROUTES.UNIVERSE_BY_ID(id));
  return handleResponse<AuditableEntity>(response);
}

export async function createEntityApi(data: EntityInput): Promise<AuditableEntity> {
  const response = await fetch(API_ROUTES.UNIVERSE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<AuditableEntity>(response);
}

export async function updateEntityApi(
  id: string,
  data: Partial<EntityInput>,
): Promise<AuditableEntity> {
  const response = await fetch(API_ROUTES.UNIVERSE_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<AuditableEntity>(response);
}

export async function deleteEntityApi(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.UNIVERSE_BY_ID(id), {
    method: 'DELETE',
  });

  return handleResponse<{ success: boolean }>(response);
}

// ── Risk Assessment ──

export async function fetchRiskAssessments(entityId: string): Promise<RiskAssessment[]> {
  const response = await fetch(`${API_ROUTES.UNIVERSE_BY_ID(entityId)}/risk-assessments`);
  return handleResponse<RiskAssessment[]>(response);
}

export async function createRiskAssessmentApi(data: RiskAssessmentInput): Promise<RiskAssessment> {
  const response = await fetch(`${API_ROUTES.UNIVERSE_BY_ID(data.entityId)}/risk-assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<RiskAssessment>(response);
}

// ── Risk Assessment Factors ──

export async function fetchRiskAssessmentFactors(includeInactive = false): Promise<RiskAssessmentFactor[]> {
  const params = includeInactive ? '?includeInactive=true' : '';
  const response = await fetch(`/api/settings/risk-factors${params}`);
  return handleResponse<RiskAssessmentFactor[]>(response);
}

export async function createRiskAssessmentFactorApi(data: RiskAssessmentFactorInput): Promise<RiskAssessmentFactor> {
  const response = await fetch('/api/settings/risk-factors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskAssessmentFactor>(response);
}

export async function updateRiskAssessmentFactorApi(id: string, data: Partial<RiskAssessmentFactorInput>): Promise<RiskAssessmentFactor> {
  const response = await fetch(`/api/settings/risk-factors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskAssessmentFactor>(response);
}

export async function deleteRiskAssessmentFactorApi(id: string): Promise<{ id: string }> {
  const response = await fetch(`/api/settings/risk-factors/${id}`, { method: 'DELETE' });
  return handleResponse<{ id: string }>(response);
}

// ── Assessment Sources ──

export async function fetchAssessmentSources(includeInactive = false): Promise<AssessmentSource[]> {
  const params = includeInactive ? '?includeInactive=true' : '';
  const response = await fetch(`/api/settings/assessment-sources${params}`);
  return handleResponse<AssessmentSource[]>(response);
}

export async function createAssessmentSourceApi(data: AssessmentSourceInput): Promise<AssessmentSource> {
  const response = await fetch('/api/settings/assessment-sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AssessmentSource>(response);
}

export async function updateAssessmentSourceApi(id: string, data: Partial<AssessmentSourceInput>): Promise<AssessmentSource> {
  const response = await fetch(`/api/settings/assessment-sources/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AssessmentSource>(response);
}

export async function deleteAssessmentSourceApi(id: string): Promise<{ id: string }> {
  const response = await fetch(`/api/settings/assessment-sources/${id}`, { method: 'DELETE' });
  return handleResponse<{ id: string }>(response);
}

// ── Risk Catalogue (Settings) ──

export async function fetchRiskCatalogueItems(includeInactive = false): Promise<RiskCatalogueItem[]> {
  const params = includeInactive ? '?includeInactive=true' : '';
  const response = await fetch(`/api/settings/risk-catalogue${params}`);
  return handleResponse<RiskCatalogueItem[]>(response);
}

export async function createRiskCatalogueItemApi(data: RiskCatalogueItemInput): Promise<RiskCatalogueItem> {
  const response = await fetch('/api/settings/risk-catalogue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskCatalogueItem>(response);
}

export async function updateRiskCatalogueItemApi(id: string, data: Partial<RiskCatalogueItemInput> & { isActive?: boolean }): Promise<RiskCatalogueItem> {
  const response = await fetch(`/api/settings/risk-catalogue/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RiskCatalogueItem>(response);
}

export async function deleteRiskCatalogueItemApi(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/settings/risk-catalogue/${id}`, { method: 'DELETE' });
  return handleResponse<{ success: boolean }>(response);
}

// ── Entity Risks (Universe) ──

export async function fetchEntityRisks(entityId: string): Promise<EntityRisk[]> {
  const response = await fetch(`${API_ROUTES.UNIVERSE_BY_ID(entityId)}/risks`);
  return handleResponse<EntityRisk[]>(response);
}

export async function createEntityRiskApi(entityId: string, data: EntityRiskInput): Promise<EntityRisk> {
  const response = await fetch(`${API_ROUTES.UNIVERSE_BY_ID(entityId)}/risks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EntityRisk>(response);
}

export async function copyRisksFromCatalogueApi(entityId: string, catalogueItemIds: string[]): Promise<EntityRisk[]> {
  const response = await fetch(`${API_ROUTES.UNIVERSE_BY_ID(entityId)}/risks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ catalogueItemIds }),
  });
  return handleResponse<EntityRisk[]>(response);
}

export async function updateEntityRiskApi(entityId: string, riskId: string, data: Partial<EntityRiskInput>): Promise<EntityRisk> {
  const response = await fetch(`${API_ROUTES.UNIVERSE_BY_ID(entityId)}/risks/${riskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EntityRisk>(response);
}

export async function deleteEntityRiskApi(entityId: string, riskId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_ROUTES.UNIVERSE_BY_ID(entityId)}/risks/${riskId}`, {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}
