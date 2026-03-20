import { withAccess } from '@/server/middleware/withAccess';
import { createAuditObjective } from '@/server/actions/engagement';

export const POST = withAccess('engagement:create', async (req, context, session) => {
  const { id } = await context.params;
  const body = await req.json();
  const data = await createAuditObjective(id, body, session.user.id, session.user.name);
  return Response.json({ data }, { status: 201 });
});
