// =============================================================================
// USER TYPES
// =============================================================================

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  role: string;
  status: string;
  provider: string;
  supervisorId: string | null;
  supervisor: UserSummary | null;
  description: string | null;
  avatarUrl: string | null;
  expertises: ExpertiseSummary[];
  teams: UserTeamMembership[];
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends User {
  roles: RoleSummary[];
}

export interface UserTeamMembership {
  id: string;
  name: string;
  role: string;
}

// =============================================================================
// TEAM TYPES
// =============================================================================

export interface Team {
  id: string;
  name: string;
  description: string | null;
  status: string;
  owner: UserSummary | null;
  members: TeamMember[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  title: string | null;
  avatarUrl: string | null;
  userRole: string;
  phone: string | null;
  teamRole: string;
  joinedAt: string;
}

// =============================================================================
// ROLE & PERMISSION TYPES
// =============================================================================

export interface RoleSummary {
  id: string;
  name: string;
  description: string | null;
}

// =============================================================================
// EXPERTISE TYPES
// =============================================================================

export interface Expertise {
  id: string;
  label: string;
  code: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ExpertiseSummary {
  id: string;
  label: string;
  code: string | null;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  title?: string;
  role: string;
  supervisorId?: string;
  description?: string;
  expertiseIds?: string[];
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  title?: string | null;
  role?: string;
  supervisorId?: string | null;
  description?: string | null;
  status?: string;
  expertiseIds?: string[];
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  ownerId: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string | null;
  ownerId?: string;
  status?: string;
}

export interface CreateExpertiseInput {
  label: string;
  code?: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateExpertiseInput {
  label?: string;
  code?: string | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}
