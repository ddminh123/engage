import { API_ROUTES } from '@/constants/routes';
import { ApiError } from '@/lib/api-error';
import type {
  User, UserDetail, Team, Expertise,
  CreateUserInput, UpdateUserInput,
  CreateTeamInput, UpdateTeamInput,
  CreateExpertiseInput, UpdateExpertiseInput,
} from './types';

// =============================================================================
// HELPERS
// =============================================================================

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(res.status, json.error?.message || 'Request failed', json.error?.code);
  }
  return json.data;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) qs.set(k, v);
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

// =============================================================================
// USERS
// =============================================================================

export async function fetchUsers(filters?: {
  search?: string;
  role?: string;
  status?: string;
  teamId?: string;
}): Promise<User[]> {
  const query = buildQuery(filters || {});
  const res = await fetch(`${API_ROUTES.SETTINGS_USERS}${query}`);
  return handleResponse(res);
}

export async function fetchUserById(id: string): Promise<UserDetail> {
  const res = await fetch(API_ROUTES.SETTINGS_USERS_BY_ID(id));
  return handleResponse(res);
}

export async function createUser(data: CreateUserInput): Promise<User> {
  const res = await fetch(API_ROUTES.SETTINGS_USERS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
  const res = await fetch(API_ROUTES.SETTINGS_USERS_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function lockUser(id: string): Promise<void> {
  const res = await fetch(API_ROUTES.SETTINGS_USER_LOCK(id), { method: 'POST' });
  await handleResponse(res);
}

export async function unlockUser(id: string): Promise<void> {
  const res = await fetch(API_ROUTES.SETTINGS_USER_UNLOCK(id), { method: 'POST' });
  await handleResponse(res);
}

// =============================================================================
// TEAMS
// =============================================================================

export async function fetchTeams(filters?: {
  search?: string;
  status?: string;
}): Promise<Team[]> {
  const query = buildQuery(filters || {});
  const res = await fetch(`${API_ROUTES.TEAMS}${query}`);
  return handleResponse(res);
}

export async function fetchTeamById(id: string): Promise<Team> {
  const res = await fetch(API_ROUTES.TEAMS_BY_ID(id));
  return handleResponse(res);
}

export async function createTeam(data: CreateTeamInput): Promise<Team> {
  const res = await fetch(API_ROUTES.TEAMS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateTeam(id: string, data: UpdateTeamInput): Promise<Team> {
  const res = await fetch(API_ROUTES.TEAMS_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteTeam(id: string): Promise<void> {
  const res = await fetch(API_ROUTES.TEAMS_BY_ID(id), { method: 'DELETE' });
  await handleResponse(res);
}

// =============================================================================
// TEAM MEMBERS
// =============================================================================

export async function addTeamMember(
  teamId: string,
  userId: string,
  role?: string,
  fromTeamId?: string
): Promise<void> {
  const res = await fetch(API_ROUTES.TEAM_MEMBERS(teamId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role, fromTeamId }),
  });
  await handleResponse(res);
}

export async function updateTeamMember(
  teamId: string,
  userId: string,
  action: 'promote' | 'demote'
): Promise<void> {
  const res = await fetch(API_ROUTES.TEAM_MEMBER_BY_ID(teamId, userId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  await handleResponse(res);
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  const res = await fetch(API_ROUTES.TEAM_MEMBER_BY_ID(teamId, userId), {
    method: 'DELETE',
  });
  await handleResponse(res);
}

// =============================================================================
// EXPERTISE
// =============================================================================

export async function fetchExpertises(): Promise<Expertise[]> {
  const res = await fetch(API_ROUTES.SETTINGS_EXPERTISE);
  return handleResponse(res);
}

export async function createExpertise(data: CreateExpertiseInput): Promise<Expertise> {
  const res = await fetch(API_ROUTES.SETTINGS_EXPERTISE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateExpertise(id: string, data: UpdateExpertiseInput): Promise<Expertise> {
  const res = await fetch(API_ROUTES.SETTINGS_EXPERTISE_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteExpertise(id: string): Promise<void> {
  const res = await fetch(API_ROUTES.SETTINGS_EXPERTISE_BY_ID(id), { method: 'DELETE' });
  await handleResponse(res);
}
