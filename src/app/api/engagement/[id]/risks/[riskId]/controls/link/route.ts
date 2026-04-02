import { withAccess } from '@/server/middleware/withAccess';
import { linkControlToRisk, unlinkControlFromRisk } from '@/server/actions/engagement';

export const POST = withAccess('engagement:update', async (req, context, session) => {
  const { riskId } = await context.params;
  const { controlId } = await req.json();
  const data = await linkControlToRisk(riskId, controlId, session.user.id, session.user.name);
  return Response.json({ data });
});

export const DELETE = withAccess('engagement:update', async (req, context, session) => {
  const { riskId } = await context.params;
  const { controlId } = await req.json();
  const data = await unlinkControlFromRisk(riskId, controlId, session.user.id, session.user.name);
  return Response.json({ data });
});
