import { withAccess } from '@/server/middleware/withAccess';
import { updateEngagementMember, removeEngagementMember } from '@/server/actions/engagement';

export const PATCH = withAccess('engagement:update', async (req, context, session) => {
  const { id, userId } = await context.params;
  const body = await req.json();
  const data = await updateEngagementMember(id, userId, body, session.user.id, session.user.name);
  return Response.json({ data });
});

export const DELETE = withAccess('engagement:update', async (_req, context, session) => {
  const { id, userId } = await context.params;
  const data = await removeEngagementMember(id, userId, session.user.id, session.user.name);
  return Response.json({ data });
});
