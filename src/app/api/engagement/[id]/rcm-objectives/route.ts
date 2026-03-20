import { withAccess } from '@/server/middleware/withAccess';
import { createRcmObjective, syncRcmObjectives } from '@/server/actions/engagement';

export const POST = withAccess('engagement:create', async (req, context, session) => {
  const { id } = await context.params;
  const body = await req.json();

  // If body has { sync: true }, run sync instead of create
  if (body?.sync === true) {
    const data = await syncRcmObjectives(id, session.user.id, session.user.name);
    return Response.json({ data });
  }

  const data = await createRcmObjective(id, body, session.user.id, session.user.name);
  return Response.json({ data }, { status: 201 });
});
