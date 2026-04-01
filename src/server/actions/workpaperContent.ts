import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';
import { invalidateSignoffs } from './approvalEngine';
import { publishEntity } from './entityVersion';

// =============================================================================
// ENTITY REGISTRY — Maps entityType → Prisma model + fields
// =============================================================================

interface EntityConfig {
  /** Prisma model delegate name */
  model: 'engagementProcedure' | 'planningWorkpaper';
  /** DB column that stores Tiptap JSON content */
  contentField: string;
  /** DB column that tracks current version number */
  versionField: string;
  /** Entity type string used in audit logs */
  auditEntityType: string;
}

const ENTITY_REGISTRY: Record<string, EntityConfig> = {
  procedure: {
    model: 'engagementProcedure',
    contentField: 'content',
    versionField: 'current_version',
    auditEntityType: 'engagement_procedure',
  },
  planning_workpaper: {
    model: 'planningWorkpaper',
    contentField: 'content',
    versionField: 'current_version',
    auditEntityType: 'planning_workpaper',
  },
  // future: finding, universe_entity, etc.
};

function getConfig(entityType: string): EntityConfig {
  const config = ENTITY_REGISTRY[entityType];
  if (!config) throw new Error(`Unknown workpaper entity type: ${entityType}`);
  return config;
}

// =============================================================================
// SAVE WORKPAPER CONTENT — Generic content save for any entity type
// =============================================================================

export async function saveWorkpaperContent(
  entityType: string,
  entityId: string,
  content: unknown,
  userId: string,
  userName: string,
): Promise<void> {
  const config = getConfig(entityType);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma[config.model] as any).update({
    where: { id: entityId },
    data: { [config.contentField]: content },
  });

  // Invalidate review/approve sign-offs when content changes
  await invalidateSignoffs(entityType, entityId, userId);

  await logAudit({
    userId,
    userName,
    action: 'update',
    entityType: config.auditEntityType,
    entityId,
    changes: { content: { old: '(document)', new: '(document updated)' } },
  });
}

// =============================================================================
// SNAPSHOT BUILDERS — Per entity type
// =============================================================================

export function buildProcedureSnapshot(p: Record<string, unknown>): Record<string, unknown> {
  return {
    title: p.title,
    description: p.description,
    procedures: p.procedures,
    procedureType: p.procedure_type,
    procedureCategory: p.procedure_category,
    status: p.status,
    observations: p.observations,
    conclusion: p.conclusion,
    effectiveness: p.effectiveness,
    sampleSize: p.sample_size,
    exceptions: p.exceptions,
    priority: p.priority,
    content: p.content,
    reviewNotes: p.review_notes,
    performedBy: p.performed_by,
    reviewedBy: p.reviewed_by,
  };
}

export function buildPlanningWorkpaperSnapshot(pw: Record<string, unknown>): Record<string, unknown> {
  return {
    content: pw.content,
  };
}

/**
 * Build a snapshot for any entity type. Used by createTransitionVersion.
 */
export async function buildEntitySnapshot(
  entityType: string,
  entityId: string,
): Promise<Record<string, unknown> | null> {
  switch (entityType) {
    case 'procedure': {
      const procedure = await prisma.engagementProcedure.findUnique({
        where: { id: entityId },
      });
      if (!procedure) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return buildProcedureSnapshot(procedure as any);
    }
    case 'planning_workpaper': {
      const pw = await prisma.planningWorkpaper.findUnique({
        where: { id: entityId },
      });
      if (!pw) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return buildPlanningWorkpaperSnapshot(pw as any);
    }
    default:
      return null;
  }
}

// =============================================================================
// CREATE TRANSITION VERSION — Snapshot entity state at transition time
// =============================================================================

/**
 * Called by approvalEngine.executeTransition to create a version snapshot.
 * Returns the new version number, or null if the entity type doesn't support snapshots.
 */
export async function createTransitionVersion(
  entityType: string,
  entityId: string,
  userId: string,
  userName: string,
  options: { comment: string | null; actionLabel: string },
): Promise<number | null> {
  const snapshot = await buildEntitySnapshot(entityType, entityId);
  if (!snapshot) return null;

  const config = getConfig(entityType);

  const result = await publishEntity(entityType, entityId, snapshot, userId, userName, {
    comment: options.comment,
    versionType: 'transition',
    actionLabel: options.actionLabel,
  });

  // Update current_version on the entity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma[config.model] as any).update({
    where: { id: entityId },
    data: { [config.versionField]: result.version },
  });

  return result.version;
}

// =============================================================================
// RESTORE ENTITY VERSION — Generic restore for any entity type
// =============================================================================

export async function restoreEntityVersion(
  entityType: string,
  entityId: string,
  version: number,
  userId: string,
  userName: string,
): Promise<{ success: boolean; restoredVersion: number }> {
  const config = getConfig(entityType);

  const versionRecord = await prisma.entityVersion.findUnique({
    where: {
      entity_type_entity_id_version: {
        entity_type: entityType,
        entity_id: entityId,
        version,
      },
    },
  });
  if (!versionRecord) throw new Error('Version not found');

  const snap = versionRecord.snapshot as Record<string, unknown>;

  // Apply snapshot fields back to the entity based on type
  switch (entityType) {
    case 'procedure': {
      const existing = await prisma.engagementProcedure.findUnique({ where: { id: entityId } });
      if (!existing) throw new Error('Procedure not found');

      await prisma.engagementProcedure.update({
        where: { id: entityId },
        data: {
          title: (snap.title as string) ?? existing.title,
          description: (snap.description as string) ?? null,
          procedures: (snap.procedures as string) ?? null,
          procedure_type: (snap.procedureType as string) ?? null,
          procedure_category: (snap.procedureCategory as string) ?? null,
          observations: (snap.observations as string) ?? null,
          conclusion: (snap.conclusion as string) ?? null,
          effectiveness: (snap.effectiveness as string) ?? null,
          sample_size: (snap.sampleSize as number) ?? null,
          exceptions: (snap.exceptions as number) ?? null,
          priority: (snap.priority as string) ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: (snap.content as any) ?? undefined,
          review_notes: (snap.reviewNotes as string) ?? null,
          approval_status: 'not_started',
        },
      });
      break;
    }
    case 'planning_workpaper': {
      const existing = await prisma.planningWorkpaper.findUnique({ where: { id: entityId } });
      if (!existing) throw new Error('Planning workpaper not found');

      await prisma.planningWorkpaper.update({
        where: { id: entityId },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: (snap.content as any) ?? undefined,
          approval_status: 'not_started',
        },
      });
      break;
    }
    default:
      throw new Error(`Restore not supported for entity type: ${entityType}`);
  }

  await logAudit({
    userId,
    userName,
    action: 'update',
    entityType: config.auditEntityType,
    entityId,
    changes: { restore: { old: null, new: `Restored to version ${version}` } },
  });

  return { success: true, restoredVersion: version };
}
