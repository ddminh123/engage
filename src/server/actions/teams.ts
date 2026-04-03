import { prisma } from '@/lib/prisma';
import { z } from 'zod/v4';

// =============================================================================
// PERMISSION CHECK
// =============================================================================

export async function checkAccess(
  userId: string,
  _permission: string
): Promise<boolean> {
  // CAE bypasses all permission checks
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return false;

  if (user.role === 'cae') {
    return true;
  }

  // TODO: Implement full permission lookup from UserRole → Role → Permission table
  // For now, allow all authenticated users until permission matrix is populated
  return true;
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

export type AuditAction = 'create' | 'update' | 'delete' | 'reorder' | 'sync_planning_to_execution';

export interface AuditLogData {
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }> | null;
}

export async function logAudit(data: AuditLogData): Promise<void> {
  await prisma.auditLog.create({
    data: {
      user_id: data.userId,
      user_name: data.userName,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      changes: data.changes ? JSON.parse(JSON.stringify(data.changes)) : undefined,
    },
  });
}

// =============================================================================
// TEAM SCHEMAS
// =============================================================================

export const createTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ownerId: z.string(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  ownerId: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// =============================================================================
// TEAM QUERIES
// =============================================================================

export interface TeamFilters {
  search?: string;
  status?: string;
}

export async function getTeams(filters: TeamFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.name = { contains: filters.search };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const teams = await prisma.team.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true, avatar_url: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, title: true, avatar_url: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return teams.map(mapTeam);
}

export async function getTeamById(id: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar_url: true } },
      members: {
        include: {
          user: {
            select: {
              id: true, name: true, email: true, title: true,
              avatar_url: true, role: true, phone: true,
            },
          },
        },
        orderBy: { joined_at: 'asc' },
      },
    },
  });

  if (!team) return null;
  return mapTeam(team);
}

// =============================================================================
// TEAM MUTATIONS
// =============================================================================

export async function createTeam(data: z.infer<typeof createTeamSchema>) {
  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      owner_id: data.ownerId,
      members: {
        create: { user_id: data.ownerId, role: 'owner' },
      },
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar_url: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, title: true, avatar_url: true } },
        },
      },
    },
  });

  return mapTeam(team);
}

export async function updateTeam(id: string, data: z.infer<typeof updateTeamSchema>) {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;

  if (data.ownerId !== undefined) {
    updateData.owner_id = data.ownerId;
    // Demote current owner, promote new owner
    const currentOwnerMember = await prisma.teamMember.findFirst({
      where: { team_id: id, role: 'owner' },
    });
    if (currentOwnerMember && currentOwnerMember.user_id !== data.ownerId) {
      await prisma.teamMember.update({
        where: { team_id_user_id: { team_id: id, user_id: currentOwnerMember.user_id } },
        data: { role: 'member' },
      });
    }
    // Ensure new owner is a member and has owner role
    await prisma.teamMember.upsert({
      where: { team_id_user_id: { team_id: id, user_id: data.ownerId } },
      update: { role: 'owner' },
      create: { team_id: id, user_id: data.ownerId, role: 'owner' },
    });
  }

  const team = await prisma.team.update({
    where: { id },
    data: updateData,
    include: {
      owner: { select: { id: true, name: true, email: true, avatar_url: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, title: true, avatar_url: true } },
        },
      },
    },
  });

  return mapTeam(team);
}

export async function deleteTeam(id: string) {
  const memberCount = await prisma.teamMember.count({ where: { team_id: id } });
  if (memberCount > 0) {
    throw new Error('Cannot delete team with members. Remove all members first.');
  }
  await prisma.team.delete({ where: { id } });
}

// =============================================================================
// TEAM MEMBER OPERATIONS
// =============================================================================

export async function addTeamMember(teamId: string, userId: string, role: string = 'member') {
  return prisma.teamMember.create({
    data: { team_id: teamId, user_id: userId, role },
    include: {
      user: { select: { id: true, name: true, email: true, title: true, avatar_url: true } },
    },
  });
}

export async function removeTeamMember(teamId: string, userId: string) {
  const member = await prisma.teamMember.findUnique({
    where: { team_id_user_id: { team_id: teamId, user_id: userId } },
  });

  if (member?.role === 'owner') {
    throw new Error('Cannot remove team owner. Promote another member first.');
  }

  await prisma.teamMember.delete({
    where: { team_id_user_id: { team_id: teamId, user_id: userId } },
  });
}

export async function moveTeamMember(userId: string, fromTeamId: string, toTeamId: string) {
  const member = await prisma.teamMember.findUnique({
    where: { team_id_user_id: { team_id: fromTeamId, user_id: userId } },
  });

  if (!member) {
    throw new Error('Member not found in source team.');
  }

  if (member.role === 'owner') {
    throw new Error('Cannot move team owner. Promote another member first.');
  }

  await prisma.$transaction([
    prisma.teamMember.delete({
      where: { team_id_user_id: { team_id: fromTeamId, user_id: userId } },
    }),
    prisma.teamMember.create({
      data: { team_id: toTeamId, user_id: userId, role: 'member' },
    }),
  ]);
}

export async function promoteToOwner(teamId: string, userId: string) {
  // Demote current owner(s) to member
  await prisma.teamMember.updateMany({
    where: { team_id: teamId, role: 'owner' },
    data: { role: 'member' },
  });

  // Promote target user
  await prisma.teamMember.update({
    where: { team_id_user_id: { team_id: teamId, user_id: userId } },
    data: { role: 'owner' },
  });

  // Update team owner
  await prisma.team.update({
    where: { id: teamId },
    data: { owner_id: userId },
  });
}

export async function demoteToMember(teamId: string, userId: string) {
  // Ensure there's at least one other owner
  const ownerCount = await prisma.teamMember.count({
    where: { team_id: teamId, role: 'owner' },
  });

  if (ownerCount <= 1) {
    throw new Error('Cannot demote the only owner. Promote another member first.');
  }

  await prisma.teamMember.update({
    where: { team_id_user_id: { team_id: teamId, user_id: userId } },
    data: { role: 'member' },
  });
}

// =============================================================================
// TEAM MAPPER
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTeam(team: any) {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    status: team.status,
    owner: team.owner
      ? { id: team.owner.id, name: team.owner.name, email: team.owner.email, avatarUrl: team.owner.avatar_url }
      : null,
    members: team.members?.map((m: { role: string; joined_at: Date; user: { id: string; name: string; email: string; title?: string | null; avatar_url?: string | null; role?: string; phone?: string | null } }) => ({
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      title: m.user.title,
      avatarUrl: m.user.avatar_url,
      userRole: m.user.role,
      phone: m.user.phone,
      teamRole: m.role,
      joinedAt: m.joined_at,
    })) || [],
    memberCount: team.members?.length || 0,
    createdAt: team.created_at,
    updatedAt: team.updated_at,
  };
}
