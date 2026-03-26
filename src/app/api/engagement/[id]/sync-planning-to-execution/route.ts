import { withAccess } from '@/server/middleware/withAccess';
import { syncPlanningToExecution } from '@/server/actions/engagement';

export const POST = withAccess('engagement:update', async (req, context, session) => {
  const { id } = await context.params;
  const data = await syncPlanningToExecution(id, session.user.id, session.user.name);
  return Response.json({ data });
});
