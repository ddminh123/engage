import { withAccess } from '@/server/middleware/withAccess';
import {
  getWpAssignments,
  addWpAssignment,
  removeWpAssignment,
  bulkAssignChildren,
} from '@/server/actions/engagement';

function mapAssignments(assignments: Awaited<ReturnType<typeof getWpAssignments>>) {
  return assignments.map((a) => ({
    id: a.id,
    userId: a.user_id,
    entityType: a.entity_type,
    entityId: a.entity_id,
    user: {
      id: a.user.id,
      name: a.user.name,
      email: a.user.email,
      title: a.user.title,
      avatarUrl: a.user.avatar_url,
    },
  }));
}

// GET /api/engagement/[id]/wp-assignments
export const GET = withAccess('engagement:read', async (_req, context) => {
  const { id } = await context.params;
  const assignments = await getWpAssignments(id);
  return Response.json({ data: mapAssignments(assignments) });
});

// POST /api/engagement/[id]/wp-assignments
// Body: { entityType, entityId, userIds: string[], cascade?: boolean }
export const POST = withAccess('engagement:update', async (req, context, session) => {
  const { id } = await context.params;
  const body = await req.json();
  const { entityType, entityId, userIds, cascade } = body;

  if (!entityType || !entityId || !Array.isArray(userIds) || userIds.length === 0) {
    return Response.json({ error: { code: 'INVALID_INPUT', message: 'entityType, entityId, and userIds are required' } }, { status: 400 });
  }

  await addWpAssignment(id, entityType, entityId, userIds, session.user.id, session.user.name);

  if (cascade && (entityType === 'section' || entityType === 'objective')) {
    await bulkAssignChildren(id, entityType, entityId, userIds, session.user.id, session.user.name);
  }

  const assignments = await getWpAssignments(id);
  return Response.json({ data: mapAssignments(assignments) });
});

// DELETE /api/engagement/[id]/wp-assignments
// Body: { entityType, entityId, userId }
export const DELETE = withAccess('engagement:update', async (req, context, session) => {
  const { id } = await context.params;
  const body = await req.json();
  const { entityType, entityId, userId: targetUserId } = body;

  if (!entityType || !entityId || !targetUserId) {
    return Response.json({ error: { code: 'INVALID_INPUT', message: 'entityType, entityId, and userId are required' } }, { status: 400 });
  }

  await removeWpAssignment(id, entityType, entityId, targetUserId, session.user.id, session.user.name);

  const assignments = await getWpAssignments(id);
  return Response.json({ data: mapAssignments(assignments) });
});
