import { withAccess } from '@/server/middleware/withAccess';
import { getEngagementMembers, addEngagementMember } from '@/server/actions/engagement';

export const GET = withAccess('engagement:read', async (_req, context) => {
  const { id } = await context.params;
  const data = await getEngagementMembers(id);
  return Response.json({ data });
});

export const POST = withAccess('engagement:update', async (req, context, session) => {
  const { id } = await context.params;
  const body = await req.json();
  const data = await addEngagementMember(id, body, session.user.id, session.user.name);
  return Response.json({ data }, { status: 201 });
});
