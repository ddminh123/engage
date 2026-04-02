import { withAccess } from '@/server/middleware/withAccess';
import { updateEngagementControl, deleteEngagementControl } from '@/server/actions/engagement';

export const PATCH = withAccess('engagement:update', async (req, context, session) => {
  const { controlId } = await context.params;
  const body = await req.json();
  const data = await updateEngagementControl(controlId, body, session.user.id, session.user.name);
  return Response.json({ data });
});

export const DELETE = withAccess('engagement:delete', async (_req, context, session) => {
  const { controlId } = await context.params;
  const data = await deleteEngagementControl(controlId, session.user.id, session.user.name);
  return Response.json({ data });
});
