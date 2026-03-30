import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';
import { publishEntity, buildProcedureSnapshot } from './entityVersion';

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
  nextAssigneeId?: string | null,
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

  // 4. Create version snapshot on every transition
  // "start" actions get labeled "Bản thảo" (Draft) for the first version
  const versionLabel = transition.action_type === 'start' ? 'Bản thảo' : transition.action_label;
  await createTransitionVersion(entityType, entityId, userId, userName, {
    comment: comment ?? null,
    actionLabel: versionLabel,
  });

  // 5. Create sign-off record for submit/review/approve actions
  const signoffType = ACTION_TYPE_TO_SIGNOFF[transition.action_type];
  if (signoffType) {
    await createSignoff({
      engagementId,
      entityType,
      entityId,
      signoffType,
      userId,
      version: currentEntity.currentVersion,
      transitionId,
      comment: comment ?? null,
    });

    // Backward compat: populate inline fields from sign-off
    await populateInlineSignoffFields(entityType, entityId, signoffType, userId);
  }

  // 5b. Handle assignment changes
  if (nextAssigneeId) {
    // When a next person is picked, replace all current assignees with the next person
    await replaceAssignees(engagementId, entityType, entityId, nextAssigneeId);
  } else {
    // No next person — just auto-assign the acting user
    await upsertAssignment(engagementId, entityType, entityId, userId);
  }

  // 6. Audit log
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

  // 3b. Create "Bản thảo" version snapshot for start transitions
  if (transition.action_type === 'start') {
    await createTransitionVersion(entityType, entityId, userId, userName, {
      comment: null,
      actionLabel: 'Bản thảo',
    });
  }

  // 3c. Auto-assign WpAssignment for procedure entities on start
  if (transition.action_type === 'start' && entityType === 'procedure') {
    const proc = await prisma.engagementProcedure.findUnique({
      where: { id: entityId },
      select: { engagement_id: true },
    });
    if (proc) {
      await upsertAssignment(proc.engagement_id, entityType, entityId, userId);
    }
  }

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

// =============================================================================
// SIGNOFF — Immutable sign-off records
// =============================================================================

// Maps workflow action_type → signoff_type. Only these actions create sign-offs.
const ACTION_TYPE_TO_SIGNOFF: Record<string, string> = {
  submit: 'prepare',
  review: 'review',
  approve: 'approve',
};

// Audit-relevant fields on procedures — changes to these invalidate review/approve sign-offs
const AUDIT_RELEVANT_FIELDS = new Set([
  'content', 'observations', 'conclusion', 'effectiveness',
  'sample_size', 'exceptions', 'procedures', 'description',
]);

async function createSignoff(params: {
  engagementId: string;
  entityType: string;
  entityId: string;
  signoffType: string;
  userId: string;
  version: number;
  transitionId: string;
  comment: string | null;
}) {
  await prisma.wpSignoff.create({
    data: {
      engagement_id: params.engagementId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      signoff_type: params.signoffType,
      user_id: params.userId,
      version: params.version || null,
      transition_id: params.transitionId,
      comment: params.comment,
    },
  });
}

/**
 * Populate legacy inline fields (performed_by, reviewed_by, approved_by) from sign-off data.
 * This keeps backward compatibility while WpSignoff is the source of truth.
 */
async function populateInlineSignoffFields(
  entityType: string,
  entityId: string,
  signoffType: string,
  userId: string,
) {
  if (entityType === 'procedure') {
    const fieldMap: Record<string, { userField: string; dateField: string }> = {
      prepare: { userField: 'performed_by', dateField: 'performed_at' },
      review: { userField: 'reviewed_by', dateField: 'reviewed_at' },
      // approve is already handled by executeTransition's approved_by logic
    };
    const mapping = fieldMap[signoffType];
    if (mapping) {
      await prisma.engagementProcedure.update({
        where: { id: entityId },
        data: {
          [mapping.userField]: userId,
          [mapping.dateField]: new Date(),
        },
      });
    }
  }
}

/**
 * Upsert a WpAssignment (auto-assign user to entity on transition).
 * Only for entity types that support assignments (procedure, section, objective).
 */
async function upsertAssignment(
  engagementId: string,
  entityType: string,
  entityId: string,
  userId: string,
) {
  const WP_ENTITY_TYPES = ['section', 'objective', 'procedure'];
  if (!WP_ENTITY_TYPES.includes(entityType)) return;

  await prisma.wpAssignment.upsert({
    where: {
      user_id_entity_type_entity_id: {
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
      },
    },
    create: {
      engagement_id: engagementId,
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
    },
    update: {}, // already assigned — no-op
  });
}

/**
 * Replace all current assignees for an entity with a single new assignee.
 * Used when a transition includes a next-person pick (e.g. submit → reviewer).
 */
async function replaceAssignees(
  engagementId: string,
  entityType: string,
  entityId: string,
  newUserId: string,
) {
  const WP_ENTITY_TYPES = ['section', 'objective', 'procedure'];
  if (!WP_ENTITY_TYPES.includes(entityType)) return;

  // Delete all existing assignments for this entity
  await prisma.wpAssignment.deleteMany({
    where: {
      entity_type: entityType,
      entity_id: entityId,
    },
  });

  // Create the single new assignment
  await prisma.wpAssignment.create({
    data: {
      engagement_id: engagementId,
      user_id: newUserId,
      entity_type: entityType,
      entity_id: entityId,
    },
  });
}

/**
 * Invalidate review and approve sign-offs when content changes after sign-off.
 * Called from content-save endpoints.
 */
export async function invalidateSignoffs(
  entityType: string,
  entityId: string,
  invalidatedBy: string,
) {
  await prisma.wpSignoff.updateMany({
    where: {
      entity_type: entityType,
      entity_id: entityId,
      signoff_type: { in: ['review', 'approve'] },
      invalidated_at: null, // only invalidate non-invalidated ones
    },
    data: {
      invalidated_at: new Date(),
      invalidated_by: invalidatedBy,
    },
  });
}

/**
 * Check whether a set of changed fields contains audit-relevant fields.
 * Used to decide whether to call invalidateSignoffs.
 */
export function hasAuditRelevantChanges(changedFields: string[]): boolean {
  return changedFields.some((f) => AUDIT_RELEVANT_FIELDS.has(f));
}

/**
 * Get sign-offs for an entity, ordered by signed_at.
 */
export async function getSignoffs(entityType: string, entityId: string) {
  return prisma.wpSignoff.findMany({
    where: { entity_type: entityType, entity_id: entityId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar_url: true, title: true },
      },
    },
    orderBy: { signed_at: 'asc' },
  });
}

/**
 * Get sign-offs for all entities in an engagement.
 */
export async function getEngagementSignoffs(engagementId: string) {
  return prisma.wpSignoff.findMany({
    where: { engagement_id: engagementId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar_url: true, title: true },
      },
    },
    orderBy: { signed_at: 'asc' },
  });
}

// =============================================================================
// CREATE VERSION ON TRANSITION — Snapshot entity state at transition time
// =============================================================================

async function createTransitionVersion(
  entityType: string,
  entityId: string,
  userId: string,
  userName: string,
  options: { comment: string | null; actionLabel: string },
): Promise<void> {
  switch (entityType) {
    case 'procedure': {
      const procedure = await prisma.engagementProcedure.findUnique({
        where: { id: entityId },
      });
      if (!procedure) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snapshot = buildProcedureSnapshot(procedure as any);
      const result = await publishEntity(entityType, entityId, snapshot, userId, userName, {
        comment: options.comment,
        versionType: 'transition',
        actionLabel: options.actionLabel,
      });

      // Update current_version on the procedure
      await prisma.engagementProcedure.update({
        where: { id: entityId },
        data: { current_version: result.version },
      });
      break;
    }
    // Future entity types (planning_workpaper, etc.) can be added here
    default:
      // No snapshot builder for this entity type yet — skip silently
      break;
  }
}
