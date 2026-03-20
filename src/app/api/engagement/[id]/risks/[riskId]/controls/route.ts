import { withAccess } from '@/server/middleware/withAccess';
import { createEngagementControl } from '@/server/actions/engagement';

export const POST = withAccess('engagement:create', async (req, context, session) => {
  const { riskId } = await context.params;
  const body = await req.json();
  const data = await createEngagementControl(riskId, body, session.user.id, session.user.name);
  return Response.json({ data }, { status: 201 });
});
