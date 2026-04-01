import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';
import { z } from 'zod';

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const publishEntitySchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  snapshot: z.any(),
  comment: z.string().nullable().optional(),
});

// =============================================================================
// PUBLISH — Create a new version snapshot
// =============================================================================

export async function publishEntity(
  entityType: string,
  entityId: string,
  snapshot: unknown,
  userId: string,
  userName: string,
  options?: {
    comment?: string | null;
    versionType?: string | null;
    actionLabel?: string | null;
  },
) {
  const { comment, versionType, actionLabel } = options ?? {};

  // Get the next version number
  const lastVersion = await prisma.entityVersion.findFirst({
    where: { entity_type: entityType, entity_id: entityId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  const nextVersion = (lastVersion?.version ?? 0) + 1;

  const version = await prisma.entityVersion.create({
    data: {
      entity_type: entityType,
      entity_id: entityId,
      version: nextVersion,
      version_type: versionType ?? null,
      action_label: actionLabel ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      snapshot: snapshot as any,
      comment: comment ?? null,
      published_by: userId,
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: `${entityType}_version`,
    entityId,
    changes: { version: { old: null, new: nextVersion }, comment: { old: null, new: comment ?? '(none)' } },
  });

  return {
    id: version.id,
    entityType: version.entity_type,
    entityId: version.entity_id,
    version: version.version,
    versionType: version.version_type,
    actionLabel: version.action_label,
    comment: version.comment,
    publishedBy: version.published_by,
    publishedAt: version.published_at.toISOString(),
  };
}

// =============================================================================
// GET VERSION HISTORY
// =============================================================================

export async function getVersionHistory(entityType: string, entityId: string) {
  const versions = await prisma.entityVersion.findMany({
    where: { entity_type: entityType, entity_id: entityId },
    orderBy: { version: 'desc' },
    include: {
      publisher: {
        select: { id: true, name: true, avatar_url: true },
      },
    },
  });

  return versions.map((v) => ({
    id: v.id,
    entityType: v.entity_type,
    entityId: v.entity_id,
    version: v.version,
    versionType: v.version_type,
    actionLabel: v.action_label,
    comment: v.comment,
    publishedBy: v.published_by,
    publishedAt: v.published_at.toISOString(),
    publisher: {
      id: v.publisher.id,
      name: v.publisher.name,
      avatarUrl: v.publisher.avatar_url,
    },
  }));
}

// =============================================================================
// GET SINGLE VERSION (with snapshot)
// =============================================================================

export async function getVersion(entityType: string, entityId: string, version: number) {
  const v = await prisma.entityVersion.findUnique({
    where: {
      entity_type_entity_id_version: {
        entity_type: entityType,
        entity_id: entityId,
        version,
      },
    },
    include: {
      publisher: {
        select: { id: true, name: true, avatar_url: true },
      },
    },
  });

  if (!v) throw new Error('Version not found');

  return {
    id: v.id,
    entityType: v.entity_type,
    entityId: v.entity_id,
    version: v.version,
    snapshot: v.snapshot,
    comment: v.comment,
    publishedBy: v.published_by,
    publishedAt: v.published_at.toISOString(),
    publisher: {
      id: v.publisher.id,
      name: v.publisher.name,
      avatarUrl: v.publisher.avatar_url,
    },
  };
}

// =============================================================================
// RESTORE VERSION — Delegates to shared restoreEntityVersion
// =============================================================================

export async function restoreProcedureVersion(
  procedureId: string,
  version: number,
  userId: string,
  userName: string,
) {
  const { restoreEntityVersion } = await import('./workpaperContent');
  return restoreEntityVersion('procedure', procedureId, version, userId, userName);
}

// Snapshot builders moved to workpaperContent.ts
// Re-export for backward compatibility if needed
export { buildProcedureSnapshot } from './workpaperContent';
