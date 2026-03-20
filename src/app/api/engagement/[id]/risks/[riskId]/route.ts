import { withAccess } from '@/server/middleware/withAccess';
import { updateEngagementRisk, deleteEngagementRisk } from '@/server/actions/engagement';

export const PATCH = withAccess('engagement:update', async (req, context, session) => {
  const { riskId } = await context.params;
  const body = await req.json();
  const data = await updateEngagementRisk(riskId, body, session.user.id, session.user.name);
  return Response.json({ data });
});

export const DELETE = withAccess('engagement:delete', async (_req, context, session) => {
  const { riskId } = await context.params;
  const data = await deleteEngagementRisk(riskId, session.user.id, session.user.name);
  return Response.json({ data });
});
