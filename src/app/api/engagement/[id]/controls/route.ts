import { withAccess } from '@/server/middleware/withAccess';
import { createEngagementControl } from '@/server/actions/engagement';

export const POST = withAccess('engagement:create', async (req, context, session) => {
  const { id } = await context.params;
  const body = await req.json();
  const { linkToRiskId, ...controlData } = body;
  const data = await createEngagementControl(id, controlData, session.user.id, session.user.name, linkToRiskId);
  return Response.json({ data }, { status: 201 });
});
