import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod/v4';

// =============================================================================
// SCHEMAS
// =============================================================================

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  title: z.string().optional(),
  role: z.enum(['cae', 'admin', 'team_owner', 'member']),
  supervisorId: z.string().optional(),
  description: z.string().optional(),
  expertiseIds: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  role: z.enum(['cae', 'admin', 'team_owner', 'member']).optional(),
  supervisorId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['active', 'locked', 'inactive']).optional(),
  expertiseIds: z.array(z.string()).optional(),
});

// =============================================================================
// QUERIES
// =============================================================================

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  teamId?: string;
}

export async function getUsers(filters: UserFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];
  }

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.teamId) {
    where.team_memberships = {
      some: { team_id: filters.teamId },
    };
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      expertises: {
        include: { expertise: true },
      },
      team_memberships: {
        include: {
          team: { select: { id: true, name: true } },
        },
      },
      supervisor: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return users.map(mapUser);
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      expertises: {
        include: { expertise: true },
      },
      team_memberships: {
        include: {
          team: { select: { id: true, name: true } },
        },
      },
      supervisor: {
        select: { id: true, name: true, email: true },
      },
      user_roles: {
        include: { role: true },
      },
    },
  });

  if (!user) return null;
  return mapUserDetail(user);
}

// =============================================================================
// MUTATIONS
// =============================================================================

export async function createUser(data: z.infer<typeof createUserSchema>) {
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password_hash: passwordHash,
      phone: data.phone,
      title: data.title,
      role: data.role,
      supervisor_id: data.supervisorId,
      description: data.description,
      expertises: data.expertiseIds?.length
        ? {
            create: data.expertiseIds.map((id) => ({ expertise_id: id })),
          }
        : undefined,
    },
    include: {
      expertises: { include: { expertise: true } },
      supervisor: { select: { id: true, name: true, email: true } },
    },
  });

  // Assign system role
  const role = await prisma.role.findFirst({
    where: {
      name: data.role === 'cae' ? 'CAE'
        : data.role === 'admin' ? 'Admin'
        : data.role === 'team_owner' ? 'Team Owner'
        : 'Team Member',
      is_system: true,
    },
  });

  if (role) {
    await prisma.userRole.create({
      data: { user_id: user.id, role_id: role.id },
    });
  }

  return mapUser(user);
}

export async function updateUser(id: string, data: z.infer<typeof updateUserSchema>) {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.supervisorId !== undefined) updateData.supervisor_id = data.supervisorId;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;

  if (data.password) {
    updateData.password_hash = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      expertises: { include: { expertise: true } },
      supervisor: { select: { id: true, name: true, email: true } },
    },
  });

  // Update expertise if provided
  if (data.expertiseIds !== undefined) {
    await prisma.userExpertise.deleteMany({ where: { user_id: id } });
    if (data.expertiseIds.length > 0) {
      await prisma.userExpertise.createMany({
        data: data.expertiseIds.map((eid) => ({
          user_id: id,
          expertise_id: eid,
        })),
      });
    }
  }

  // Update system role if role changed
  if (data.role !== undefined) {
    await prisma.userRole.deleteMany({ where: { user_id: id } });
    const role = await prisma.role.findFirst({
      where: {
        name: data.role === 'cae' ? 'CAE'
          : data.role === 'admin' ? 'Admin'
          : data.role === 'team_owner' ? 'Team Owner'
          : 'Team Member',
        is_system: true,
      },
    });
    if (role) {
      await prisma.userRole.create({
        data: { user_id: id, role_id: role.id },
      });
    }
  }

  return mapUser(user);
}

export async function lockUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { status: 'locked' },
  });
}

export async function unlockUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { status: 'active' },
  });
}

export async function deactivateUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { status: 'inactive' },
  });
}

// =============================================================================
// MAPPERS
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    title: user.title,
    role: user.role,
    status: user.status,
    provider: user.provider,
    supervisorId: user.supervisor_id,
    supervisor: user.supervisor || null,
    description: user.description,
    avatarUrl: user.avatar_url,
    expertises: user.expertises?.map((ue: { expertise: { id: string; label: string; code: string | null } }) => ({
      id: ue.expertise.id,
      label: ue.expertise.label,
      code: ue.expertise.code,
    })) || [],
    teams: user.team_memberships?.map((tm: { role: string; team: { id: string; name: string } }) => ({
      id: tm.team.id,
      name: tm.team.name,
      role: tm.role,
    })) || [],
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserDetail(user: any) {
  return {
    ...mapUser(user),
    roles: user.user_roles?.map((ur: { role: { id: string; name: string; description: string | null } }) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description,
    })) || [],
  };
}
