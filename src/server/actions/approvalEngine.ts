import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';
import { createTransitionVersion } from './workpaperContent';

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
// GET WORKFLOW SIGNOFF TYPES — Which sign-off levels does the workflow support?
// =============================================================================

const SIGNOFF_ORDER: readonly string[] = ['prepare', 'review', 'approve'];

export interface SignoffTypeInfo {
  type: string;
  count: number;
}

/**
 * Resolve the workflow ID for an entity type + optional sub_type.
 * Lookup chain: exact match → base type fallback → default workflow.
 */
async function resolveWorkflowId(entityType: string, subType: string = ''): Promise<string | null> {
  // 1. Exact match (entity_type + sub_type)
  const exact = await prisma.approvalEntityBinding.findUnique({
    where: { entity_type_sub_type: { entity_type: entityType, sub_type: subType } },
    select: { workflow_id: true },
  });
  if (exact) {
    const wf = await prisma.approvalWorkflow.findUnique({ where: { id: exact.workflow_id }, select: { is_active: true } });
    if (wf?.is_active) return exact.workflow_id;
    return null;
  }

  // 2. Fallback to base type (sub_type = '') if subType was specified
  if (subType) {
    const base = await prisma.approvalEntityBinding.findUnique({
      where: { entity_type_sub_type: { entity_type: entityType, sub_type: '' } },
      select: { workflow_id: true },
    });
    if (base) {
      const wf = await prisma.approvalWorkflow.findUnique({ where: { id: base.workflow_id }, select: { is_active: true } });
      if (wf?.is_active) return base.workflow_id;
      return null;
    }
  }

  // 3. Fallback to default workflow
  const def = await prisma.approvalWorkflow.findFirst({ where: { is_default: true, is_active: true }, select: { id: true } });
  return def?.id ?? null;
}

export async function getWorkflowSignoffTypes(entityType: string, subType: string = ''): Promise<SignoffTypeInfo[]> {
  const wfId = await resolveWorkflowId(entityType, subType);
  if (!wfId) return [];

  // 2. Query only transitions explicitly flagged to generate signoffs, sorted by sort_order.
  const flagged = await prisma.approvalTransition.findMany({
    where: { workflow_id: wfId, generates_signoff: true, signoff_type: { not: null } },
    select: { signoff_type: true, sort_order: true },
    orderBy: { sort_order: 'asc' },
  });

  // 3. Count signoff slots per type (read directly from signoff_type).
  const typeCounters = new Map<string, number>();
  for (const t of flagged) {
    const st = t.signoff_type!;
    typeCounters.set(st, (typeCounters.get(st) ?? 0) + 1);
  }

  // 4. Return in canonical order (prepare → review → approve)
  const result: SignoffTypeInfo[] = [];
  for (const type of SIGNOFF_ORDER) {
    const count = typeCounters.get(type);
    if (count) result.push({ type, count });
  }
  return result;
}

// =============================================================================
// GET AVAILABLE TRANSITIONS — Returns actions the current user can perform
// =============================================================================

export async function getAvailableTransitions(
  entityType: string,
  currentStatus: string,
  userId: string,
  engagementId: string,
  lastPublishedBy?: string | null,
  subType: string = '',
): Promise<AvailableTransition[]> {
  // Build list of statuses to query (current + aliases)
  const statusesToQuery = [currentStatus, ...(STATUS_ALIASES[currentStatus] ?? [])];

  // 1. Resolve workflow via binding chain (exact → base → default)
  const wfId = await resolveWorkflowId(entityType, subType);
  if (!wfId) return [];

  const workflow = await prisma.approvalWorkflow.findUnique({
    where: { id: wfId },
    include: {
      transitions: {
        where: { from_status: { in: statusesToQuery } },
        orderBy: { sort_order: 'asc' },
      },
    },
  });

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
  subType: string = '',
): Promise<{ newStatus: string; actionType: string }> {
  // 1. Load the transition
  const transition = await prisma.approvalTransition.findUnique({
    where: { id: transitionId },
    include: { workflow: true },
  });

  if (!transition) throw new Error('Transition not found');

  // Validate: the resolved workflow for this entity must match the transition's workflow
  const resolvedWfId = await resolveWorkflowId(entityType, subType);
  if (resolvedWfId !== transition.workflow.id) {
    throw new Error('Transition does not match entity type');
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
    subType,
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

  // 5. Create sign-off record if transition is flagged to generate signoff
  const signoffType = transition.generates_signoff && transition.signoff_type ? transition.signoff_type : null;
  if (signoffType) {
    // Derive signoff_order from the forward path of the workflow
    const signoffOrder = await deriveSignoffOrder(
      transition.workflow_id,
      signoffType,
      transition.to_status,
    );

    await createSignoff({
      engagementId,
      entityType,
      entityId,
      signoffType,
      signoffOrder,
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
  subType: string = '',
): Promise<{ newStatus: string } | null> {
  // 1. Get current status
  const currentEntity = await getEntityStatus(entityType, entityId);
  if (!currentEntity) return null;

  // 2. Resolve workflow via binding chain (exact → base → default)
  const workflowId = await resolveWorkflowId(entityType, subType);
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

// Legacy mapping kept for reference. Signoff type is now explicit via `signoff_type` field on ApprovalTransition.
// action_type only has special behavior for: 'start' (draft version + auto-assign) and 'approve' (stamps approval fields + self-approval check).

// Audit-relevant fields on procedures — changes to these invalidate review/approve sign-offs
const AUDIT_RELEVANT_FIELDS = new Set([
  'content', 'observations', 'conclusion', 'effectiveness',
  'sample_size', 'exceptions', 'procedures', 'description',
]);

/**
 * Derive the signoff_order for a given transition by counting flagged transitions
 * of the same signoff_type. Returns the 1-based position.
 *
 * When multiple transitions share the same sort_order, we break the tie using
 * the BFS flow-order of their from_status so that transitions earlier in the
 * workflow path receive lower signoff orders.
 */
async function deriveSignoffOrder(
  workflowId: string,
  signoffType: string,
  toStatus: string,
): Promise<number> {
  const flagged = await prisma.approvalTransition.findMany({
    where: { workflow_id: workflowId, generates_signoff: true, signoff_type: signoffType },
    select: { from_status: true, to_status: true, sort_order: true },
    orderBy: { sort_order: 'asc' },
  });

  if (flagged.length <= 1) {
    return 1;
  }

  // Build flow-order map (BFS from start) to break sort_order ties
  const flowOrder = await resolveFlowOrder(workflowId);

  const sorted = [...flagged].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return (flowOrder.get(a.from_status) ?? Infinity) - (flowOrder.get(b.from_status) ?? Infinity);
  });

  const idx = sorted.findIndex((t) => t.to_status === toStatus);
  return idx >= 0 ? idx + 1 : Math.max(sorted.length, 1);
}

/**
 * BFS traversal of the workflow graph following only forward transitions
 * (start, submit, review, approve). Returns a Map<status, bfsOrder>.
 */
async function resolveFlowOrder(workflowId: string): Promise<Map<string, number>> {
  const transitions = await prisma.approvalTransition.findMany({
    where: { workflow_id: workflowId },
    select: { from_status: true, to_status: true, action_type: true },
    orderBy: { sort_order: 'asc' },
  });

  const FORWARD_TYPES = new Set(['start', 'submit', 'review', 'approve']);
  const edges = new Map<string, string[]>();
  const startStatuses: string[] = [];

  for (const t of transitions) {
    if (!FORWARD_TYPES.has(t.action_type)) continue;
    const list = edges.get(t.from_status) ?? [];
    list.push(t.to_status);
    edges.set(t.from_status, list);
    if (t.action_type === 'start') {
      startStatuses.push(t.from_status);
    }
  }

  // BFS from start statuses
  const order = new Map<string, number>();
  const queue = [...new Set(startStatuses)];
  let pos = 0;

  for (const s of queue) {
    if (!order.has(s)) order.set(s, pos++);
  }

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    for (const next of edges.get(current) ?? []) {
      if (!order.has(next)) {
        order.set(next, pos++);
        queue.push(next);
      }
    }
  }

  return order;
}

async function createSignoff(params: {
  engagementId: string;
  entityType: string;
  entityId: string;
  signoffType: string;
  signoffOrder: number;
  userId: string;
  version: number;
  transitionId?: string | null;
  comment: string | null;
}) {
  await prisma.wpSignoff.create({
    data: {
      engagement_id: params.engagementId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      signoff_type: params.signoffType,
      signoff_order: params.signoffOrder,
      user_id: params.userId,
      version: params.version || null,
      transition_id: params.transitionId ?? null,
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
      invalidated_at: null,
    },
    data: {
      invalidated_at: new Date(),
      invalidated_by: invalidatedBy,
      invalidation_reason: 'content_changed',
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
// MANUAL SIGN / UNSIGN — Direct signoff actions from the signoff bar
// =============================================================================

const SIGNOFF_LEVEL: Record<string, number> = { prepare: 0, review: 1, approve: 2 };

/**
 * Manual sign: user clicks signoff bar to sign a specific stage.
 * Enforces order between levels (prepare < review < approve).
 * Flexible within the same level (review 1 and review 2 can be signed in any order).
 */
export async function manualSign(params: {
  entityType: string;
  entityId: string;
  engagementId: string;
  signoffType: string;
  signoffOrder: number;
  userId: string;
  subType?: string;
}): Promise<void> {
  const { entityType, entityId, engagementId, signoffType, signoffOrder, userId, subType = '' } = params;

  // 1. Check no active duplicate
  const existing = await prisma.wpSignoff.findFirst({
    where: {
      entity_type: entityType,
      entity_id: entityId,
      signoff_type: signoffType,
      signoff_order: signoffOrder,
      invalidated_at: null,
    },
  });
  if (existing) throw new Error('This stage is already signed');

  // 2. Enforce order between levels — all lower-level stages must be signed
  const currentLevel = SIGNOFF_LEVEL[signoffType] ?? 0;
  if (currentLevel > 0) {
    // Get the workflow signoff stages to know what lower stages exist
    const allStages = await getWorkflowSignoffTypes(entityType, subType);
    for (const stage of allStages) {
      const stageLevel = SIGNOFF_LEVEL[stage.type] ?? 0;
      if (stageLevel >= currentLevel) continue;
      // Check all rounds of this lower-level type are signed
      for (let order = 1; order <= stage.count; order++) {
        const lowerSigned = await prisma.wpSignoff.findFirst({
          where: {
            entity_type: entityType,
            entity_id: entityId,
            signoff_type: stage.type,
            signoff_order: order,
            invalidated_at: null,
          },
        });
        if (!lowerSigned) {
          throw new Error(`Cần ký "${stage.type}" trước khi ký "${signoffType}"`);
        }
      }
    }
  }

  // 3. Get entity version
  const entity = await getEntityStatus(entityType, entityId);
  if (!entity) throw new Error('Entity not found');

  // 4. Create signoff
  await createSignoff({
    engagementId,
    entityType,
    entityId,
    signoffType,
    signoffOrder,
    userId,
    version: entity.currentVersion,
    transitionId: null,
    comment: null,
  });

  // Backward compat: populate inline fields
  await populateInlineSignoffFields(entityType, entityId, signoffType, userId);
}

/**
 * Unsign: remove a signoff by invalidating it.
 * Rules:
 * 1. Can only unsign your own signoff (unless admin — future).
 * 2. Locked if any higher-level signoff is active.
 */
export async function unsignSignoff(params: {
  entityType: string;
  entityId: string;
  signoffType: string;
  signoffOrder: number;
  userId: string;
}): Promise<void> {
  const { entityType, entityId, signoffType, signoffOrder, userId } = params;

  // 1. Find the active signoff for this stage
  const signoff = await prisma.wpSignoff.findFirst({
    where: {
      entity_type: entityType,
      entity_id: entityId,
      signoff_type: signoffType,
      signoff_order: signoffOrder,
      invalidated_at: null,
    },
  });
  if (!signoff) throw new Error('No active signoff found for this stage');

  // 2. Check ownership
  if (signoff.user_id !== userId) {
    throw new Error('Bạn chỉ có thể gỡ chữ ký của chính mình');
  }

  // 3. Lock check — no higher-level signoff may be active
  const currentLevel = SIGNOFF_LEVEL[signoffType] ?? 0;
  const higherSignoffs = await prisma.wpSignoff.findMany({
    where: {
      entity_type: entityType,
      entity_id: entityId,
      invalidated_at: null,
      NOT: {
        signoff_type: signoffType,
        signoff_order: signoffOrder,
      },
    },
  });

  for (const hs of higherSignoffs) {
    const hsLevel = SIGNOFF_LEVEL[hs.signoff_type] ?? 0;
    if (hsLevel > currentLevel) {
      throw new Error('Cần gỡ chữ ký cấp cao hơn trước');
    }
    // Same level, higher order → also blocks
    if (hsLevel === currentLevel && hs.signoff_order > signoffOrder) {
      throw new Error('Cần gỡ chữ ký cấp cao hơn trước');
    }
  }

  // 4. Invalidate
  await prisma.wpSignoff.update({
    where: { id: signoff.id },
    data: {
      invalidated_at: new Date(),
      invalidated_by: userId,
      invalidation_reason: 'user_unsign',
    },
  });
}

// createTransitionVersion is now in workpaperContent.ts (shared across entity types)
