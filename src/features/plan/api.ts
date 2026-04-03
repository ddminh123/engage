import { API_ROUTES } from '@/constants';
import { ApiError } from '@/lib/api-error';
import type {
  AuditPlan,
  PlanSummary,
  PlanInput,
  PlanUpdateInput,
  PlannedAudit,
  PlannedAuditInput,
  PlannedAuditUpdateInput,
} from './types';

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

// ── Plan CRUD ──

export async function fetchPlans(): Promise<PlanSummary[]> {
  const response = await fetch(API_ROUTES.PLAN);
  return handleResponse<PlanSummary[]>(response);
}

export async function fetchPlanById(id: string): Promise<AuditPlan> {
  const response = await fetch(API_ROUTES.PLAN_BY_ID(id));
  return handleResponse<AuditPlan>(response);
}

export async function createPlanApi(data: PlanInput): Promise<AuditPlan> {
  const response = await fetch(API_ROUTES.PLAN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuditPlan>(response);
}

export async function updatePlanApi(
  id: string,
  data: PlanUpdateInput,
): Promise<AuditPlan> {
  const response = await fetch(API_ROUTES.PLAN_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuditPlan>(response);
}

export async function deletePlanApi(id: string): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.PLAN_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── Planned Audit CRUD ──

export async function addPlannedAuditApi(
  planId: string,
  data: PlannedAuditInput,
): Promise<PlannedAudit> {
  const response = await fetch(API_ROUTES.PLAN_AUDITS(planId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<PlannedAudit>(response);
}

export async function updatePlannedAuditApi(
  planId: string,
  auditId: string,
  data: PlannedAuditUpdateInput,
): Promise<PlannedAudit> {
  const response = await fetch(API_ROUTES.PLAN_AUDIT_BY_ID(planId, auditId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<PlannedAudit>(response);
}

export async function removePlannedAuditApi(
  planId: string,
  auditId: string,
): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.PLAN_AUDIT_BY_ID(planId, auditId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}
