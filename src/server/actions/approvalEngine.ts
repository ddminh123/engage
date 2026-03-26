import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';

// =============================================================================
// TYPES
// =============================================================================

export interface AvailableTransition {
  id: string;
  fromStatus: string;
  toStatus: string;
  actionLabel: string;
  actionType: string;
}

// Status aliases — interchangeable statuses for transition lookup
const STATUS_ALIASES: Record<string, string[]> = {
  reviewed: ['approved'],
  approved: ['reviewed'],
};

// =============================================================================
// GET AVAILABLE TRANSITIONS — Returns actions the current user can perform
// =============================================================================

export async function getAvailableTransitions(
  entityType: string,
  currentStatus: string,
  userId: string,
  engagementId: string,
  lastPublishedBy?: string | null,
): Promise<AvailableTransition[]> {
  // Build list of statuses to query (current + aliases)
  const statusesToQuery = [currentStatus, ...(STATUS_ALIASES[currentStatus] ?? [])];

  // 1. Load workflow for this entity type via binding, fallback to default
  const binding = await prisma.approvalEntityBinding.findUnique({
    where: { entity_type: entityType },
    select: { workflow_id: true },
  });

  let workflow;
  if (binding) {
    workflow = await prisma.approvalWorkflow.findUnique({
      where: { id: binding.workflow_id },
      include: {
        transitions: {
          where: { from_status: { in: statusesToQuery } },
          orderBy: { sort_order: 'asc' },
        },
      },
    });
  } else {
    // Fallback to default workflow
    workflow = await prisma.approvalWorkflow.findFirst({
      where: { is_default: true, is_active: true },
      include: {
        transitions: {
          where: { from_status: { in: statusesToQuery } },
          orderBy: { sort_order: 'asc' },
        },
      },
    });
  }

  if (!workflow || !workflow.is_active) return [];

  // 2. Resolve user roles
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return [];

  const userRoles: string[] = [user.role];

  // Add engagement member role if engagementId provided
  if (engagementId) {
    const membership = await prisma.engagementMember.findUnique({
      where: {
        engagement_id_user_id: {
          engagement_id: engagementId,
          user_id: userId,
        },
      },
      select: { role: true },
    });
    if (membership) {
      userRoles.push(membership.role);
    }
  }

  // 3. Filter transitions by role + self-approval rules
  const available: AvailableTransition[] = [];

  for (const t of workflow.transitions) {
    const allowedRoles = t.allowed_roles as string[];

    // Check role match
    const hasWildcard = allowedRoles.includes('*');
    const hasRoleMatch = allowedRoles.some((r) => userRoles.includes(r));

    if (!hasWildcard && !hasRoleMatch) continue;

    // Self-approval check: block if action_type = "approve" and self-approval disabled
    if (
      t.action_type === 'approve' &&
      !workflow.allow_self_approval &&
      lastPublishedBy &&
      userId === lastPublishedBy &&
      user.role !== 'cae' // CAE always allowed
    ) {
      continue;
    }

    available.push({
      id: t.id,
      fromStatus: t.from_status,
      toStatus: t.to_status,
      actionLabel: t.action_label,
      actionType: t.action_type,
    });
  }

  return available;
}

// =============================================================================
// EXECUTE TRANSITION — Validate and perform a status transition
// =============================================================================

export async function executeTransition(
  entityType: string,
  entityId: string,
  transitionId: string,
  userId: string,
  userName: string,
  engagementId: string,
  comment?: string | null,
): Promise<{ newStatus: string; actionType: string }> {
  // 1. Load the transition
  const transition = await prisma.approvalTransition.findUnique({
    where: { id: transitionId },
    include: { workflow: true },
  });

  if (!transition) throw new Error('Transition not found');

  // Validate via binding: the workflow must be bound to this entity type, or be the default
  const binding = await prisma.approvalEntityBinding.findFirst({
    where: { entity_type: entityType, workflow_id: transition.workflow.id },
  });
  if (!binding) {
    // Allow if this is the default workflow and entity has no explicit binding
    const entityHasBinding = await prisma.approvalEntityBinding.findUnique({
      where: { entity_type: entityType },
    });
    if (entityHasBinding || !transition.workflow.is_default) {
      throw new Error('Transition does not match entity type');
    }
  }

  // 2. Validate user can perform this transition
  const currentEntity = await getEntityStatus(entityType, entityId);
  if (!currentEntity) throw new Error('Entity not found');

  const validFromStatuses = [
    transition.from_status,
    ...(STATUS_ALIASES[transition.from_status] ?? []),
  ];
  if (!validFromStatuses.includes(currentEntity.approvalStatus)) {
    throw new Error(
      `Cannot transition from "${currentEntity.approvalStatus}" via this action (expected "${transition.from_status}")`,
    );
  }

  const available = await getAvailableTransitions(
    entityType,
    currentEntity.approvalStatus,
    userId,
    engagementId,
    currentEntity.lastPublishedBy,
  );

  if (!available.find((a) => a.id === transitionId)) {
    throw new Error('You do not have permission to perform this action');
  }

  // 3. Execute the transition
  const updateData: Record<string, unknown> = {
    approval_status: transition.to_status,
  };

  // If action is "approve", stamp approval fields
  if (transition.action_type === 'approve') {
    updateData.approved_by = userId;
    updateData.approved_at = new Date();
    updateData.approved_version = currentEntity.currentVersion;
  }

  await updateEntityStatus(entityType, entityId, updateData);

  // 4. Audit log
  await logAudit({
    userId,
    userName,
    action: 'update',
    entityType,
    entityId,
    changes: {
      approval_status: {
        old: currentEntity.approvalStatus,
        new: transition.to_status,
      },
      ...(comment ? { transition_comment: { old: null, new: comment } } : {}),
    },
  });

  return {
    newStatus: transition.to_status,
    actionType: transition.action_type,
  };
}

// =============================================================================
// AUTO-TRANSITION — Triggered automatically (e.g. not_started → in_progress)
// =============================================================================

export async function executeAutoTransition(
  entityType: string,
  entityId: string,
  actionType: string,
  userId: string,
  userName: string,
): Promise<{ newStatus: string } | null> {
  // 1. Get current status
  const currentEntity = await getEntityStatus(entityType, entityId);
  if (!currentEntity) return null;

  // 2. Find the workflow and matching auto-transition
  const binding = await prisma.approvalEntityBinding.findUnique({
    where: { entity_type: entityType },
    select: { workflow_id: true },
  });

  let workflowId: string | undefined;
  if (binding) {
    workflowId = binding.workflow_id;
  } else {
    const defaultWf = await prisma.approvalWorkflow.findFirst({
      where: { is_default: true, is_active: true },
      select: { id: true },
    });
    workflowId = defaultWf?.id;
  }
  if (!workflowId) return null;

  // Find transition matching current status (+ aliases) + action type
  const autoStatusesToQuery = [
    currentEntity.approvalStatus,
    ...(STATUS_ALIASES[currentEntity.approvalStatus] ?? []),
  ];
  const transition = await prisma.approvalTransition.findFirst({
    where: {
      workflow_id: workflowId,
      from_status: { in: autoStatusesToQuery },
      action_type: actionType,
    },
  });

  if (!transition) return null;

  // 3. Execute
  await updateEntityStatus(entityType, entityId, {
    approval_status: transition.to_status,
  });

  // 4. Audit log
  await logAudit({
    userId,
    userName,
    action: 'update',
    entityType,
    entityId,
    changes: {
      approval_status: {
        old: currentEntity.approvalStatus,
        new: transition.to_status,
      },
      auto_transition: { old: null, new: actionType },
    },
  });

  return { newStatus: transition.to_status };
}

// =============================================================================
// HELPERS — Entity-type-specific status read/write
// =============================================================================

interface EntityStatus {
  approvalStatus: string;
  currentVersion: number;
  lastPublishedBy: string | null;
}

async function getEntityStatus(
  entityType: string,
  entityId: string,
): Promise<EntityStatus | null> {
  switch (entityType) {
    case 'procedure': {
      const p = await prisma.engagementProcedure.findUnique({
        where: { id: entityId },
        select: {
          approval_status: true,
          current_version: true,
        },
      });
      if (!p) return null;

      // Get the last publisher from EntityVersion
      const lastVersion = await prisma.entityVersion.findFirst({
        where: { entity_type: 'procedure', entity_id: entityId },
        orderBy: { version: 'desc' },
        select: { published_by: true },
      });

      return {
        approvalStatus: p.approval_status,
        currentVersion: p.current_version,
        lastPublishedBy: lastVersion?.published_by ?? null,
      };
    }
    case 'work_program': {
      const eng = await prisma.engagement.findUnique({
        where: { id: entityId },
        select: { wp_approval_status: true },
      });
      if (!eng) return null;
      return {
        approvalStatus: eng.wp_approval_status,
        currentVersion: 0,
        lastPublishedBy: null,
      };
    }
    case 'planning_workpaper': {
      const pw = await prisma.planningWorkpaper.findUnique({
        where: { id: entityId },
        select: { approval_status: true, current_version: true },
      });
      if (!pw) return null;
      return {
        approvalStatus: pw.approval_status,
        currentVersion: pw.current_version,
        lastPublishedBy: null,
      };
    }
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
}

async function updateEntityStatus(
  entityType: string,
  entityId: string,
  data: Record<string, unknown>,
): Promise<void> {
  switch (entityType) {
    case 'procedure':
      await prisma.engagementProcedure.update({
        where: { id: entityId },
        data,
      });
      break;
    case 'work_program': {
      const wpData: Record<string, unknown> = {
        wp_approval_status: data.approval_status as string,
      };
      if (data.approved_by) wpData.wp_approved_by = data.approved_by;
      if (data.approved_at) wpData.wp_approved_at = data.approved_at;
      if (data.approved_version !== undefined) wpData.wp_approved_version = data.approved_version;
      await prisma.engagement.update({
        where: { id: entityId },
        data: wpData,
      });
      break;
    }
    case 'planning_workpaper':
      await prisma.planningWorkpaper.update({
        where: { id: entityId },
        data,
      });
      break;
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
}
