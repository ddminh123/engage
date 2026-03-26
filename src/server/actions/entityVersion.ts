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
  comment?: string | null,
) {
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
// RESTORE VERSION — Overwrite live entity with snapshot
// =============================================================================

export async function restoreProcedureVersion(
  procedureId: string,
  version: number,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementProcedure.findUnique({ where: { id: procedureId } });
  if (!existing) throw new Error('Procedure not found');

  const versionRecord = await prisma.entityVersion.findUnique({
    where: {
      entity_type_entity_id_version: {
        entity_type: 'procedure',
        entity_id: procedureId,
        version,
      },
    },
  });
  if (!versionRecord) throw new Error('Version not found');

  const snap = versionRecord.snapshot as Record<string, unknown>;

  await prisma.engagementProcedure.update({
    where: { id: procedureId },
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
      approval_status: 'draft',
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'update',
    entityType: 'procedure',
    entityId: procedureId,
    changes: { restore: { old: null, new: `Restored to version ${version}` } },
  });

  return { success: true, restoredVersion: version };
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
