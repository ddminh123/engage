import { withAccess } from '@/server/middleware/withAccess';
import { updateRcmObjective, deleteRcmObjective } from '@/server/actions/engagement';

export const PATCH = withAccess('engagement:update', async (req, context, session) => {
  const { objectiveId } = await context.params;
  const body = await req.json();
  const data = await updateRcmObjective(objectiveId, body, session.user.id, session.user.name);
  return Response.json({ data });
});

export const DELETE = withAccess('engagement:delete', async (_req, context, session) => {
  const { objectiveId } = await context.params;
  const data = await deleteRcmObjective(objectiveId, session.user.id, session.user.name);
  return Response.json({ data });
});
